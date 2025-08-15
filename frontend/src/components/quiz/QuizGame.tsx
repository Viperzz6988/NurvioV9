import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Brain, Trophy, RotateCcw, Star } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
  correctAnswers: number[];
  wrongAnswers: number[];
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Welche Programmiersprache wurde für die Webentwicklung erfunden?",
    options: ["Python", "JavaScript", "Java", "C++"],
    correctAnswer: 1,
    category: "Programmierung",
    difficulty: "easy",
    explanation: "JavaScript wurde speziell für die Webentwicklung von Brendan Eich bei Netscape entwickelt."
  },
  {
    id: 2,
    question: "Was bedeutet 'HTML'?",
    options: ["High Tech Modern Language", "HyperText Markup Language", "Home Tool Markup Language", "Hyperlink and Text Markup Language"],
    correctAnswer: 1,
    category: "Web",
    difficulty: "easy",
    explanation: "HTML steht für HyperText Markup Language und ist die Standard-Auszeichnungssprache für Webseiten."
  },
  {
    id: 3,
    question: "Welches Jahr gilt als Geburtsjahr des Internets?",
    options: ["1969", "1983", "1991", "1995"],
    correctAnswer: 0,
    category: "Geschichte",
    difficulty: "medium",
    explanation: "1969 wurde ARPANET gestartet, das als Vorläufer des Internets gilt."
  },
  {
    id: 4,
    question: "Was ist React?",
    options: ["Eine Datenbank", "Eine JavaScript-Bibliothek", "Ein Betriebssystem", "Ein Texteditor"],
    correctAnswer: 1,
    category: "Programmierung",
    difficulty: "medium",
    explanation: "React ist eine JavaScript-Bibliothek zur Erstellung von Benutzeroberflächen, entwickelt von Facebook."
  },
  {
    id: 5,
    question: "Welche Datenstruktur folgt dem LIFO-Prinzip?",
    options: ["Queue", "Stack", "Array", "Linked List"],
    correctAnswer: 1,
    category: "Informatik",
    difficulty: "hard",
    explanation: "Stack folgt dem Last-In-First-Out (LIFO) Prinzip - das zuletzt hinzugefügte Element wird zuerst entfernt."
  },
  {
    id: 6,
    question: "Was bedeutet 'CSS'?",
    options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Code Style Syntax"],
    correctAnswer: 1,
    category: "Web",
    difficulty: "easy",
    explanation: "CSS steht für Cascading Style Sheets und wird zur Gestaltung von Webseiten verwendet."
  },
  {
    id: 7,
    question: "Welcher Algorithmus hat eine durchschnittliche Zeitkomplexität von O(n log n)?",
    options: ["Bubble Sort", "Quick Sort", "Linear Search", "Insertion Sort"],
    correctAnswer: 1,
    category: "Informatik",
    difficulty: "hard",
    explanation: "Quick Sort hat im Durchschnitt eine Zeitkomplexität von O(n log n), im schlimmsten Fall O(n²)."
  },
  {
    id: 8,
    question: "Was ist Node.js?",
    options: ["Ein Browser", "Eine JavaScript-Laufzeitumgebung", "Eine Datenbank", "Ein Framework"],
    correctAnswer: 1,
    category: "Programmierung",
    difficulty: "medium",
    explanation: "Node.js ist eine JavaScript-Laufzeitumgebung, die auf Chrome's V8 JavaScript-Engine basiert."
  }
];

const QuizGame: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const questions = QUIZ_QUESTIONS;

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (quizStarted && !showResult) {
      interval = setInterval(() => {
        setTimeSpent(Date.now() - startTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizStarted, showResult, startTime]);

  const startQuiz = useCallback(() => {
    setQuizStarted(true);
    setStartTime(Date.now());
    setCurrentQuestion(0);
    setAnswers(Array(questions.length).fill(null));
    setSelectedAnswer(null);
    setShowResult(false);
    setShowExplanation(false);
    setTimeSpent(0);
  }, [questions.length]);

  const selectAnswer = useCallback((answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  }, []);

  const nextQuestion = useCallback(() => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Quiz finished
      const finalTimeSpent = Date.now() - startTime;
      const correctAnswers: number[] = [];
      const wrongAnswers: number[] = [];
      
      newAnswers.forEach((answer, index) => {
        if (answer === questions[index].correctAnswer) {
          correctAnswers.push(index);
        } else {
          wrongAnswers.push(index);
        }
      });

      const score = correctAnswers.length;
      const percentage = Math.round((score / questions.length) * 100);

      const result: QuizResult = {
        score,
        totalQuestions: questions.length,
        percentage,
        timeSpent: finalTimeSpent,
        correctAnswers,
        wrongAnswers
      };

      setQuizResult(result);
      setShowResult(true);
      setQuizStarted(false);
    }
  }, [selectedAnswer, answers, currentQuestion, questions, startTime]);

  const showAnswerExplanation = useCallback(() => {
    setShowExplanation(true);
  }, []);

  const resetQuiz = useCallback(() => {
    setQuizStarted(false);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowResult(false);
    setShowExplanation(false);
    setTimeSpent(0);
    setQuizResult(null);
  }, []);

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreEmoji = (percentage: number): string => {
    if (percentage === 100) return '🏆';
    if (percentage >= 80) return '🌟';
    if (percentage >= 60) return '👍';
    return '💪';
  };

  if (!quizStarted && !showResult) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="glass-card">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center">
              <Brain size={32} className="text-white" />
            </div>
            <CardTitle className="text-2xl">Nurvio Quiz Challenge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-6">
                Teste dein Wissen in verschiedenen Bereichen der Informatik und Technologie!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="glass-card p-4">
                  <div className="text-2xl font-bold text-primary">{questions.length}</div>
                  <div className="text-sm text-muted-foreground">Fragen</div>
                </div>
                <div className="glass-card p-4">
                  <div className="text-2xl font-bold text-primary">3</div>
                  <div className="text-sm text-muted-foreground">Schwierigkeitsgrade</div>
                </div>
                <div className="glass-card p-4">
                  <div className="text-2xl font-bold text-primary">~5</div>
                  <div className="text-sm text-muted-foreground">Minuten</div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-semibold mb-4">Kategorien:</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {Array.from(new Set(questions.map(q => q.category))).map(category => (
                    <Badge key={category} variant="outline">{category}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={startQuiz} className="w-full bg-gradient-primary hover:shadow-hover">
              <Brain className="mr-2" size={20} />
              Quiz starten
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResult && quizResult) {
    const isNewRecord = quizResult.percentage === 100;
    
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="glass-card">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center">
              <Trophy size={32} className="text-white" />
            </div>
            <CardTitle className="text-2xl">Quiz abgeschlossen!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(quizResult.percentage)} mb-2`}>
                {quizResult.score}/{quizResult.totalQuestions}
              </div>
              <div className={`text-3xl ${getScoreColor(quizResult.percentage)} mb-4`}>
                {quizResult.percentage}% {getScoreEmoji(quizResult.percentage)}
              </div>
              
              {isNewRecord && (
                <div className="glass-card p-4 mb-6 border-yellow-400">
                  <div className="text-yellow-600 font-bold">
                    🎉 Perfekt! Alle Fragen richtig beantwortet! 🎉
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Du bist ein echter Tech-Experte! 🚀
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="glass-card p-4">
                  <div className="text-green-600 font-bold text-xl">{quizResult.correctAnswers.length}</div>
                  <div className="text-sm text-muted-foreground">Richtig</div>
                </div>
                <div className="glass-card p-4">
                  <div className="text-lg font-bold">Zeit:</div>
                  <div className="text-sm text-muted-foreground">{formatTime(quizResult.timeSpent)}</div>
                </div>
              </div>

              {quizResult.wrongAnswers.length > 0 && (
                <div className="glass-card p-4 mb-6">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <XCircle size={16} className="mr-2 text-red-500" />
                    Verbesserungsmöglichkeiten:
                  </h3>
                  <div className="space-y-2 text-sm">
                    {quizResult.wrongAnswers.map(questionIndex => (
                      <div key={questionIndex} className="text-left">
                        <p className="font-medium">{questions[questionIndex].question}</p>
                        <p className="text-muted-foreground">
                          Richtige Antwort: {questions[questionIndex].options[questions[questionIndex].correctAnswer]}
                        </p>
                        {questions[questionIndex].explanation && (
                          <p className="text-xs text-muted-foreground italic">
                            {questions[questionIndex].explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={resetQuiz} className="flex-1 bg-gradient-primary hover:shadow-hover">
                <RotateCcw className="mr-2" size={16} />
                Nochmal versuchen
              </Button>
              <Button onClick={resetQuiz} variant="outline" className="flex-1">
                Zurück zum Start
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion) / questions.length) * 100;
  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="glass-card">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <Badge variant="outline">
              Frage {currentQuestion + 1} von {questions.length}
            </Badge>
            <div className="text-sm text-muted-foreground">
              Zeit: {formatTime(timeSpent)}
            </div>
          </div>
          <Progress value={progress} className="mb-4" />
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={question.difficulty === 'easy' ? 'secondary' : question.difficulty === 'medium' ? 'default' : 'destructive'}>
              {question.difficulty === 'easy' ? 'Einfach' : question.difficulty === 'medium' ? 'Mittel' : 'Schwer'}
            </Badge>
            <Badge variant="outline">{question.category}</Badge>
          </div>
          <CardTitle className="text-xl">{question.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {question.options.map((option, index) => {
              let buttonVariant: "outline" | "default" | "destructive" | "secondary" = "outline";
              let icon = null;
              
              if (isAnswered) {
                if (index === question.correctAnswer) {
                  buttonVariant = "default";
                  icon = <CheckCircle size={16} className="text-green-600" />;
                } else if (index === selectedAnswer && index !== question.correctAnswer) {
                  buttonVariant = "destructive";
                  icon = <XCircle size={16} className="text-red-600" />;
                }
              } else if (selectedAnswer === index) {
                buttonVariant = "secondary";
              }

              return (
                <Button
                  key={index}
                  variant={buttonVariant}
                  className="w-full justify-start text-left h-auto p-4"
                  onClick={() => selectAnswer(index)}
                  disabled={isAnswered}
                >
                  <div className="flex items-center w-full">
                    <span className="flex-1">{option}</span>
                    {icon && <span className="ml-2">{icon}</span>}
                  </div>
                </Button>
              );
            })}
          </div>

          {isAnswered && question.explanation && !showExplanation && (
            <Button 
              onClick={showAnswerExplanation} 
              variant="ghost" 
              size="sm"
              className="w-full"
            >
              <Star size={16} className="mr-2" />
              Erklärung anzeigen
            </Button>
          )}

          {showExplanation && question.explanation && (
            <div className="glass-card p-4 animate-fade-in">
              <h4 className="font-semibold mb-2 flex items-center">
                <Star size={16} className="mr-2 text-yellow-500" />
                Erklärung:
              </h4>
              <p className="text-sm text-muted-foreground">{question.explanation}</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-muted-foreground">
              {isAnswered 
                ? (isCorrect ? "Richtig! 🎉" : "Leider falsch 😔")
                : "Wähle eine Antwort"
              }
            </div>
            <Button 
              onClick={nextQuestion}
              disabled={!isAnswered}
              className={isAnswered ? "bg-gradient-primary hover:shadow-hover" : ""}
            >
              {currentQuestion === questions.length - 1 ? 'Quiz beenden' : 'Nächste Frage'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizGame;