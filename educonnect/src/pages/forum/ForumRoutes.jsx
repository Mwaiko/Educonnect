import { Route, Routes } from "react-router-dom";
import AskQuestionForm from "../components/forum/AskQuestionForm";
import QuestionDetailPage from "../components/forum/QuestionDetailPage";
import QuestionFeed from "../components/forum/QuestionFeed";

/**
 * Route subtree for the Forum & Q&A module (Module 2, Mwai Komo).
 * Mount under /forum in the app's top-level router.
 */
export default function ForumRoutes() {
  return (
    <Routes>
      <Route index element={<QuestionFeed />} />
      <Route path="ask" element={<AskQuestionForm />} />
      <Route path="questions/:questionId" element={<QuestionDetailPage />} />
    </Routes>
  );
}
