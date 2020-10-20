import React, { useState, useEffect } from 'react';
import { fetchQuizQuestions } from './API';
//components
import QuestionCard from './components/QuestionCard';
//types
import { QuestionState, Difficulty } from './API';
//styles
import { GloabalStyle, Wrapper } from './App.style'

export type AnswerObject = {
  question: string;
  answer: string;
  correct: boolean;
  correctAnswer: string;
}

const TOTAL_QUESTIONS = 10;

function App() {

  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuestionState[]>([]);
  const [number, setNumber] = useState(0);
  const [userAnswers, setUserAnswers] = useState<AnswerObject[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(true);
  const [highScore, setHighScore] = useState("0"); // high score for local storage
  const [timerSec, setTimerSec] = useState(5);
  const [showTimer, setShowTimer] = useState(false);

    // useEffect 
  //- check the high score from local storage
  useEffect(() => {
    const savedHighScore = localStorage.getItem("quizHighScore");
    if (savedHighScore) setHighScore(savedHighScore);
  }, []);
  
  // const timer = () => {
  //   let timeRun = 5;
  //   setShowTimer(true);
  //   setInterval(() => {
  //     timeRun--;
  //     setTimerSec((timerSec) => timerSec - 1);
  //     console.log("timer: ", timerSec);
  //     console.log("timeRun: ", timeRun);
  //     while (timeRun === 0) {
  //       setGameOver(true);
  //       setShowTimer(false);
  //       debugger
  //       clearInterval();
  //     }

  //   }, 500);
  // }

  const startTrivia = async () => {

    setLoading(true);
    setGameOver(false);

    const newQuestions = await fetchQuizQuestions(
      TOTAL_QUESTIONS,
      Difficulty.EASY
    );

    setQuestions(newQuestions);
    setScore(0);
    setUserAnswers([]);
    setNumber(0);
    setLoading(false);
    
    // timer();

  };

  const checkAnswer = (e: React.MouseEvent<HTMLButtonElement>) => {
    
    //users answer
    const answer = e.currentTarget.value;

    //check answer against correct answer
    const correct = questions[number].correct_answer === answer;

    // add score if answer is correct
    if (correct) setScore(prev => prev + 1);
     //sets high score
     if (score > Number(highScore)) {
      setHighScore(score.toString())
      localStorage.setItem("quizHighScore", score.toString())
    }

    if (!gameOver) {

      // save answer in the array for users answers
      const answerObject: AnswerObject = {
        question: questions[number].question,
        answer,
        correct,
        correctAnswer: questions[number].correct_answer
      };

      setUserAnswers((prev) => [...prev, answerObject]);
    }
  };

  const nextQuestion = () => {
       // sets high score
        if (score > Number(highScore)) {
          setHighScore(score.toString())
          localStorage.setItem("quizHighScore", score.toString())
        }
    //   move on to the next question if not the last
    const nextQuestion = number + 1;
    if (nextQuestion === TOTAL_QUESTIONS) {
      setGameOver(true);
    } else {
      setNumber(nextQuestion);
    }
  };

  return (
    <>
      <GloabalStyle />
      <Wrapper>
        <h1>React Quiz</h1>
        {gameOver || userAnswers.length === TOTAL_QUESTIONS ? (
          <button className="start" onClick={startTrivia}>Start</button>
        ) : null}
        {showTimer && <p>Timer: {timerSec}`S</p>}
        {highScore ? <p className="highScore">High Score: {highScore}</p> : null}
        {!gameOver ? <p className="score">Score: {score}</p> : null}
        {loading && <p>Loading Questions...</p>}
        {!loading && !gameOver && (
          <QuestionCard 
          questionNr={number + 1}
          totalQuestions={TOTAL_QUESTIONS}
          question={questions[number].question}
          answers={questions[number].answers}
          userAnswer={userAnswers ? userAnswers[number] : undefined}
          callback={checkAnswer}
          />
        )}
        {!gameOver && !loading && userAnswers.length === number + 1 && number !== TOTAL_QUESTIONS - 1 ? (
            <button className="next" onClick={nextQuestion}>Next Question</button>
            ) : null}
      </Wrapper>
    </>
  );
}

export default App;
