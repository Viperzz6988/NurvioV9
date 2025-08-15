import React from 'react';
import QuizGame from '@/components/quiz/QuizGame';

const QuizPage: React.FC = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Tech Quiz
          </h1>
          <p className="text-lg text-muted-foreground">
            Teste dein Wissen in Informatik und Technologie!
          </p>
        </div>
        <QuizGame />
      </div>
    </div>
  );
};

export default QuizPage;