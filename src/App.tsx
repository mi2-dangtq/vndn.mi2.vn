import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SurveyProvider } from "./hooks/useSurvey";
import Header from "./components/Header";
import TakeSurveyPage from "./pages/TakeSurveyPage";
import SurveyResultPage from "./pages/SurveyResultPage";
import "./App.css";

function App() {
  return (
    <SurveyProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/survey" replace />} />
              <Route path="/survey" element={<TakeSurveyPage />} />
              <Route path="/results" element={<SurveyResultPage />} />
              {/* Redirect old links to new survey page */}
              <Route
                path="/take/:shareLink"
                element={<Navigate to="/survey" replace />}
              />
            </Routes>
          </main>
        </div>
      </Router>
    </SurveyProvider>
  );
}

export default App;
