import React, { useState, useEffect } from 'react';
import { surveyApi } from '../services/api/surveyApi';
import { Survey, SurveyListItem } from '../types/survey';

interface SurveyTestProps {
  className?: string;
}

export const SurveyTest: React.FC<SurveyTestProps> = ({ className }) => {
  const [surveys, setSurveys] = useState<SurveyListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  // Test survey list
  const loadSurveys = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await surveyApi.getSurveys({
        page: 1,
        limit: 5
      });
      setSurveys(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };

  // Test survey creation
  const createTestSurvey = async () => {
    try {
      setLoading(true);
      setError(null);
      const newSurvey = await surveyApi.createSurvey({
        title: '前端测试调研',
        titleEn: 'Frontend Test Survey',
        description: '这是一个前端集成测试调研',
        isPublic: false,
        formType: 0,
        categoryId: '00000000-0000-0000-0000-000000000000',
        isLuckEnabled: false,
        createdBy: 'frontend-test-user'
      });
      
      // Reload surveys to show the new one
      await loadSurveys();
      setSelectedSurvey(newSurvey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create survey');
    } finally {
      setLoading(false);
    }
  };

  // Test survey with questions
  const loadSurveyWithQuestions = async (surveyId: string) => {
    try {
      setLoading(true);
      setError(null);
      const questions = await surveyApi.getSurveyQuestions(surveyId);
      console.log('Survey questions:', questions);
      
      const survey = await surveyApi.getSurvey(surveyId);
      setSelectedSurvey(survey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load survey details');
    } finally {
      setLoading(false);
    }
  };

  // Test question creation
  const createTestQuestion = async () => {
    if (!selectedSurvey?.id) {
      setError('Please select a survey first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const newQuestion = await surveyApi.createQuestion(selectedSurvey.id, {
        questionText: '您觉得这个前端集成测试如何？',
        questionTextEn: 'How do you feel about this frontend integration test?',
        questionType: 'radio',
        options: ['很好', '不错', '一般', '需要改进'],
        optionsEn: ['Excellent', 'Good', 'Average', 'Needs Improvement'],
        order: 1,
        isRequired: true,
        isProjected: false,
        createdBy: 'frontend-test-user'
      });
      
      console.log('Created question:', newQuestion);
      alert('Question created successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  return (
    <div className={`p-6 max-w-4xl mx-auto ${className}`}>
      <h1 className="text-2xl font-bold mb-6">Survey API Integration Test</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Survey List */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Surveys</h2>
            <button
              onClick={loadSurveys}
              disabled={loading}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
          
          {loading && <p className="text-gray-500">Loading...</p>}
          
          <div className="space-y-2">
            {surveys.map(survey => (
              <div
                key={survey.id}
                className="p-3 border rounded cursor-pointer hover:bg-gray-50"
                onClick={() => loadSurveyWithQuestions(survey.id)}
              >
                <h3 className="font-medium">{survey.title}</h3>
                <p className="text-sm text-gray-600">{survey.titleEn}</p>
                <div className="text-xs text-gray-500 mt-1">
                  Status: {survey.status} | Questions: {survey.questionCount} | Responses: {survey.responseCount}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          
          <div className="space-y-3">
            <button
              onClick={createTestSurvey}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              Create Test Survey
            </button>
            
            <button
              onClick={createTestQuestion}
              disabled={loading || !selectedSurvey}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
            >
              Add Test Question
            </button>
          </div>

          {selectedSurvey && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <h3 className="font-medium">Selected Survey:</h3>
              <p className="text-sm">{selectedSurvey.title}</p>
              <p className="text-xs text-gray-600">ID: {selectedSurvey.id}</p>
            </div>
          )}
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-6 bg-gray-100 p-4 rounded">
        <h3 className="font-medium mb-2">Debug Info:</h3>
        <p className="text-sm">
          Backend URL: <code>/api/v1/surveys</code>
        </p>
        <p className="text-sm">
          Total Surveys: {surveys.length}
        </p>
        <p className="text-sm">
          Selected Survey: {selectedSurvey ? selectedSurvey.title : 'None'}
        </p>
      </div>
    </div>
  );
};

export default SurveyTest;
