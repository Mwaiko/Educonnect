import uuid

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Answer, Question, Tag

User = get_user_model()


def make_user(username, role="student", **extra):
    return User.objects.create_user(
        username=username,
        email=f"{username}@example.com",
        password="StrongPass123!",
        role=role,
        **extra,
    )


class QuestionAPITests(APITestCase):
    def setUp(self):
        self.author = make_user("author")
        self.other = make_user("other")
        self.client.force_authenticate(self.author)

    def test_create_question_with_tags(self):
        url = reverse("question-list")
        payload = {
            "title": "How does Dijkstra's algorithm handle negative weights?",
            "body": "Looking for clarification...",
            "tags": ["Algorithms", "graphs", "algorithms"],
        }
        response = self.client.post(url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(set(response.data["tags"]), {"algorithms", "graphs"})
        self.assertEqual(Question.objects.count(), 1)
        self.assertEqual(Tag.objects.count(), 2)

    def test_create_question_requires_title_and_body(self):
        url = reverse("question-list")
        response = self.client.post(url, {"title": "", "body": ""}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_questions_filter_by_tag(self):
        q1 = Question.objects.create(author=self.author, title="Q1", body="b1")
        q2 = Question.objects.create(author=self.author, title="Q2", body="b2")
        tag = Tag.objects.create(name="algorithms")
        q1.tags.add(tag)

        url = reverse("question-list")
        response = self.client.get(url, {"tag": "algorithms"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [r["id"] for r in response.data["results"]]
        self.assertIn(str(q1.id), ids)
        self.assertNotIn(str(q2.id), ids)

    def test_only_author_can_update_question(self):
        question = Question.objects.create(author=self.author, title="Q", body="b")
        url = reverse("question-detail", args=[question.id])

        self.client.force_authenticate(self.other)
        response = self.client.patch(url, {"title": "Hacked"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.author)
        response = self.client.patch(url, {"title": "Updated"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Updated")

    def test_upvote_toggle(self):
        question = Question.objects.create(author=self.other, title="Q", body="b")
        url = reverse("question-upvote", args=[question.id])

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["upvote_count"], 1)
        self.assertTrue(response.data["user_has_upvoted"])

        response = self.client.post(url)
        self.assertEqual(response.data["upvote_count"], 0)
        self.assertFalse(response.data["user_has_upvoted"])

    def test_retrieve_question_includes_answers(self):
        question = Question.objects.create(author=self.author, title="Q", body="b")
        Answer.objects.create(question=question, author=self.other, body="An answer")

        url = reverse("question-detail", args=[question.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["answers"]), 1)


class AnswerAPITests(APITestCase):
    def setUp(self):
        self.question_author = make_user("asker")
        self.solver = make_user("solver")
        self.expert = make_user("expert", role="expert_solver")
        self.question = Question.objects.create(
            author=self.question_author, title="Q", body="b"
        )

    def test_post_answer(self):
        self.client.force_authenticate(self.solver)
        url = reverse("question-answers-create", args=[self.question.id])
        response = self.client.post(url, {"body": "Here's the answer."}, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Answer.objects.count(), 1)
        self.assertEqual(response.data["author"]["username"], "solver")

    def test_empty_answer_rejected(self):
        self.client.force_authenticate(self.solver)
        url = reverse("question-answers-create", args=[self.question.id])
        response = self.client.post(url, {"body": "   "}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_only_expert_or_admin_can_endorse(self):
        answer = Answer.objects.create(question=self.question, author=self.solver, body="A")
        url = reverse("answer-endorse", args=[answer.id])

        self.client.force_authenticate(self.solver)
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.expert)
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["is_endorsed"])

        # Toggle off
        response = self.client.post(url)
        self.assertFalse(response.data["is_endorsed"])

    def test_only_question_author_can_accept(self):
        answer = Answer.objects.create(question=self.question, author=self.solver, body="A")
        url = reverse("answer-accept", args=[answer.id])

        self.client.force_authenticate(self.solver)
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.question_author)
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["is_accepted"])

        answer.refresh_from_db()
        self.question.refresh_from_db()
        self.assertTrue(answer.is_accepted)
        self.assertTrue(self.question.is_resolved)

    def test_accepting_new_answer_unaccepts_previous(self):
        answer1 = Answer.objects.create(
            question=self.question, author=self.solver, body="A1", is_accepted=True
        )
        answer2 = Answer.objects.create(question=self.question, author=self.solver, body="A2")

        self.client.force_authenticate(self.question_author)
        url = reverse("answer-accept", args=[answer2.id])
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        answer1.refresh_from_db()
        answer2.refresh_from_db()
        self.assertFalse(answer1.is_accepted)
        self.assertTrue(answer2.is_accepted)

    def test_answer_upvote_toggle(self):
        answer = Answer.objects.create(question=self.question, author=self.solver, body="A")
        self.client.force_authenticate(self.question_author)
        url = reverse("answer-upvote", args=[answer.id])

        response = self.client.post(url)
        self.assertEqual(response.data["upvote_count"], 1)

        response = self.client.post(url)
        self.assertEqual(response.data["upvote_count"], 0)

    def test_only_author_can_edit_answer(self):
        answer = Answer.objects.create(question=self.question, author=self.solver, body="A")
        url = reverse("answer-detail", args=[answer.id])

        self.client.force_authenticate(self.question_author)
        response = self.client.patch(url, {"body": "Hacked"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.solver)
        response = self.client.patch(url, {"body": "Edited"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["body"], "Edited")
