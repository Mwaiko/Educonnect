import { Route, Routes } from "react-router-dom";
import AskQuestionForm from "./AskQuestionForm";
import QuestionDetailPage from "./QuestionDetailPage";
import QuestionFeed from "./QuestionFeed";

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
