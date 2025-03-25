import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import DefaultBoy from "./assets/default_boy.png"
import DefaultBoySad from "./assets/default_boy_sad.png"
import DefaultBoyWin from "./assets/default_boy_win.png"
import DefaultBoyTakeShoise from "./assets/default_boy_take_shoise.png"
import { motion } from 'framer-motion';


import Stone from "./assets/stone.svg"

function App() {
  const [firstStart, setFirstStart] = useState(true);

  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  const [openModal, setOpenModal] = useState(false);

  const [selectMode, setSelectMode] = useState(0);
  const [selectModeName, setSelectModeName] = useState("");

  const [gameStart, setGameStart] = useState(false);
  const refItem = useRef(null)

  const [round, setRound] = useState(0); // Добавим состояние для номера раунда
  const [scoreUser, setScoreUser] = useState(15);
  const [scoreComp, setScoreComp] = useState(15);
  const [lastMove, setLastMove] = useState("");
  const [lastCompMove, setCompLastMove] = useState("");
  const [defaultImageUser, setDefaultImageUser] = useState(DefaultBoy);
  const [defaultImageComp, setDefaultImageComp] = useState(DefaultBoy);

  const stashOptions = () => {
    setRound(0);
    setScoreUser(15);
    setScoreComp(15);
    setLastMove("");
    setCompLastMove("");
    setDefaultImageUser(DefaultBoy);
    setDefaultImageComp(DefaultBoy);
    setGameStart(false);
    setSelectModeName("");
    setSelectMode(0);
  }

  const chekScored = (user, comp) => {
    if (user === "Довериться") {
      if (user === comp) {
          setScoreUser(prevValue => prevValue + 5)
          setScoreComp(prevValue => prevValue + 5)
      } else if (comp === "Пропустить ход") {
        setScoreUser(prevValue => prevValue)
        setScoreComp(prevValue => prevValue)
      } else if (comp === "Обмануть") {
        setScoreUser(prevValue => prevValue - 2)
        setScoreComp(prevValue => prevValue + 5)
      }
    } else if (user === "Пропустить ход") {
      if (user === comp) {
          setScoreUser(prevValue => prevValue)
          setScoreComp(prevValue => prevValue)
      } else if (comp === "Довериться") {
        setScoreUser(prevValue => prevValue)
        setScoreComp(prevValue => prevValue)
      } else if (comp === "Обмануть") {
        setScoreUser(prevValue => prevValue)
        setScoreComp(prevValue => prevValue)
      }
    } else if (user === "Обмануть") {
      if (user === comp) {
        setScoreUser(prevValue => prevValue - 1)
        setScoreComp(prevValue => prevValue - 1)
      } else if (comp === "Пропустить ход") {
        setScoreUser(prevValue => prevValue)
        setScoreComp(prevValue => prevValue)
      } else if (comp === "Довериться") {
        setScoreUser(prevValue => prevValue + 5)
        setScoreComp(prevValue => prevValue - 2)
      }
    }
  }


  const handleChange = (yourMove) => {
    let computerMove = "";

    setIsAnimating(true);
    setIsAnimatingTwo(true);

    if (selectMode === 1) {
      // Случайный выбор
      computerMove = Math.random() < 0.3 ? "Довериться" : Math.random() < 0.3 ? "Пропустить ход" : "Обмануть";
      chekScored(yourMove, computerMove);
    } else if (selectMode === 2) {
      // Око за око (TFT - Tit for Tat)
      // В первом раунде сотрудничает, затем повторяет предыдущий ход игрока
      if (round === 0) {
        computerMove = "Довериться";
      } else {
        console.log(lastMove)
        // Здесь нужно получить предыдущий ход игрока из таблицы
        // (реализация зависит от того, как вы храните историю ходов)
        //  Пока просто ставим случайный ход, чтобы не было ошибки
        computerMove = lastMove === "Довериться" ? "Обмануть" : lastMove === "Пропустить ход" ? "Обмануть" : "Обмануть";
        chekScored(yourMove, computerMove);
      }
    } else if (selectMode === 3) {
      // Выигрыш всегда (всегда обманывает)
      computerMove = yourMove === "Довериться" ? "Довериться" : lastMove === "Пропустить ход" ? "Довериться" : "Довериться";
      chekScored(yourMove, computerMove);
    } else if (selectMode === 4) {
      // Проигрыш всегда (всегда сотрудничает)
      computerMove = lastMove === "Довериться" ? "Обмануть" : lastMove === "Пропустить ход" ? "Обмануть" : "Обмануть";
      chekScored(yourMove, computerMove);
    }

    const newRow = document.createElement("tr");
    const roundCell = document.createElement("td");
    const yourMoveCell = document.createElement("td");
    const computerMoveCell = document.createElement("td");

    // Заполняем ячейки
    roundCell.textContent = round + 1; // Увеличиваем номер раунда
    yourMoveCell.textContent = yourMove;
    computerMoveCell.textContent = computerMove;

    // Добавляем ячейки в строку
    newRow.appendChild(roundCell);
    newRow.appendChild(yourMoveCell);
    newRow.appendChild(computerMoveCell);

    // Добавляем строку в таблицу
    refItem.current.appendChild(newRow);

    setRound(round + 1);
    setLastMove(yourMove);
    setCompLastMove(computerMove);
  }



  const handleStartClick = () => {
    if (age && gender) {
      setFirstStart(false);
    } else {
      alert('Пожалуйста, заполните возраст и пол.');
    }
  };

  const openStartFunction = () => {
    if (selectMode && selectModeName) {
      setGameStart(true);
    } else {
      alert('Пожалуйста, заполните возраст и пол.');
    }
  };

  const animationVariants = {
    initial: { opacity: 1, x: -50 }, // Начальное состояние (скрыто слева)
    appear: { opacity: 1, x: 0, transition: { duration: 0.5 } }, // Появление
    zoomIn: { scale: 1.2, transition: { duration: 0.3 } }, // Увеличение
    zoomOut: { scale: 1, transition: { duration: 0.3 } }, // Возврат к нормальному размеру
    exit: { opacity: 0, x: 50, transition: { duration: 0.5 } }, // Скрытие справа
  };
  const [animationStep, setAnimationStep] = useState('initial');
  const [isAnimating, setIsAnimating] = useState(false)


  const animationVariantsTwo = {
    initial: { opacity: 1, x: 50 }, // Начальное состояние (скрыто слева)
    appear: { opacity: 1, x: 0, transition: { duration: 0.5 } }, // Появление
    zoomIn: { scale: 1.2, transition: { duration: 0.3 } }, // Увеличение
    zoomOut: { scale: 1, transition: { duration: 0.3 } }, // Возврат к нормальному размеру
    exit: { opacity: 0, x: -50, transition: { duration: 0.5 } }, // Скрытие справа
  };
  const [animationStepTwo, setAnimationStepTwo] = useState('initial');
  const [isAnimatingTwo, setIsAnimatingTwo] = useState(false)

  const shangeImg = () => {
    console.log(lastMove, lastCompMove)
    if (lastMove === "Довериться" && lastCompMove === "Обмануть") {
      setDefaultImageComp(DefaultBoyWin)
      setDefaultImageUser(DefaultBoySad)
    }  else if (lastMove === "Обмануть" && lastCompMove === "Довериться") {
      setDefaultImageComp(DefaultBoySad)
      setDefaultImageUser(DefaultBoyWin)
    } else if (lastMove === "Обмануть" && lastCompMove === "Обмануть") {
      setDefaultImageComp(DefaultBoySad)
      setDefaultImageUser(DefaultBoySad)
    } else if (lastMove === "Довериться" && lastCompMove === "Довериться") {
      setDefaultImageComp(DefaultBoyWin)
      setDefaultImageUser(DefaultBoyWin)
    } else if (lastMove === "Пропустить ход" || lastCompMove === "Пропустить ход") {
      setDefaultImageComp(DefaultBoy)
      setDefaultImageUser(DefaultBoy)
    }
  }

  useEffect(() => {
    if (isAnimating) {
      setDefaultImageComp(DefaultBoyTakeShoise)
      setDefaultImageUser(DefaultBoyTakeShoise)
      // После небольшой задержки, запускаем анимацию "appear"
      setAnimationStep('appear');
      setAnimationStepTwo('appear');
      const timer1 = setTimeout(() => {
        // После появления, запускаем увеличение
        setAnimationStep('zoomIn');
        setAnimationStepTwo('zoomIn');
        shangeImg()
        const timer2 = setTimeout(() => {
          // После увеличения, возвращаемся к нормальному размеру
          setAnimationStep('zoomOut');
          setAnimationStepTwo('zoomOut');
          const timer3 = setTimeout(() => {
            // После возврата к нормальному размеру, скрываем
            setAnimationStep('exit');
            setAnimationStepTwo('exit');
            const timer4 = setTimeout(() => {
               // После скрытия, возвращаемся к начальному состоянию
              setAnimationStep('initial');
              setAnimationStepTwo('initial');
              setIsAnimating(false); // Сбрасываем флаг
              setIsAnimatingTwo(false);
            }, 700); // Время для ухода
            return () => clearTimeout(timer4);
          }, 500); // Время для возврата в исходный размер
          return () => clearTimeout(timer2);
        }, 500); // Время для увеличения
        return () => clearTimeout(timer2);
      }, 700); // Время появления
      return () => {
        clearTimeout(timer1)
      }
    }
  }, [isAnimating]);

  if (firstStart) {
    return (
      <div className="get_data_user">
        <div id="modal" className="modal">
          <h2>Инструкция и демографическая информация</h2>
          <p style={{ textAlign: 'justify', margin: '10px 0px' }}>
            Инструкция: После ввода данных начнется игра "Дилемма узника", за которой последует психологический опросник.
          </p>
          <input
            type="number"
            id="age"
            placeholder="Возраст"
            required
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
          <select
            id="gender"
            required
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="" disabled>Пол</option>
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
          </select>
          <button id="startButton" onClick={handleStartClick}>
            Начать исследование
          </button>
        </div>
      </div>
    );
  } else if (round < 30) {
    return (
      <div className="App">
        <div className="main-container">
          {!gameStart ?
            <div className="game-container">
              <h1>Дилемма узника</h1>
              <div style={{display: "flex", alignItems: "center", marginBottom: "5px"}}>
                <p style={{width: "220px"}} id="mode">{selectMode === 0 ? "Выберите режим" : selectModeName}</p>
                <button style={{margin: "0px"}} onClick={() => setOpenModal(prevValue => !prevValue)}>Выбрать режим</button>
              </div>
              <button style={{margin: "0px"}} onClick={openStartFunction}>Начать игру</button>
            </div>
          : 
            <div className="moves-table-block" style={{display: "flex", gap: "10px"}}>
              <div className="moves-table">
                <div>
                  <p>Выберите ваш ход:</p>
                  <div className='buttons_chek' style={{display: "flex", alignItems: "center"}}>
                    <button className='button_style' onClick={() => handleChange("Довериться")}>Довериться</button>
                    <button className='button_style' onClick={() => handleChange("Пропустить ход")}>Пропустить ход</button>
                    <button className='button_style' onClick={() => handleChange("Обмануть")}>Обмануть</button>
                  </div>
                  <div className='animations-blocks'>
                  <motion.div
                      style={{
                        position: 'relative',
                      }}
                      className='animations-blocks-one-man'
                      variants={animationVariants}
                      initial={0}
                      animate={animationStep}
                    >
                      <img src={defaultImageUser}/>
                    </motion.div>
                    {/* <div className='animations-blocks-one-man'>
                      <img src={DefaultBoy}/>
                    </div> */}
                    <div className='animations-blocks-stone'>
                      <img src={Stone}/>
                    </div>
                    <motion.div
                      style={{
                        position: 'relative',
                      }}
                      className='animations-blocks-two-man'
                      variants={animationVariantsTwo}
                      initial={0}
                      animate={animationStepTwo}
                    >
                      <img src={defaultImageComp}/>
                    </motion.div>
                  </div>
                  <div id="result">Раунд: {round} / 30<br/>Ваши баллы: {scoreUser} | Баллы противника: {scoreComp}</div>
                  <div id="stats"></div>
                </div>
              </div>
              <div className="moves-table">
                <div className='table-block'>
                  <table>
                    <thead>
                      <tr>
                        <th>Раунд</th>
                        <th>Ваш ход</th>
                        <th>Ход компьютера</th>
                      </tr>
                    </thead>
                    <tbody id="movesHistory" ref={refItem}>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          }
        </div>
        <div style={openModal ? {opacity: 1} : {opacity: 0, display: 'none'}} id="myModal" className="modal_two">
          <div className="modal-content_two">
            <span className="close" onClick={() => setOpenModal(prevValue => !prevValue)}>&times;</span>
            <h2>Выберите режим</h2>
            <div class="mode-selection">
              <button
                onClick={() => {
                  setSelectMode(1);
                  setSelectModeName("Случайный выбор");
                  setOpenModal(false);
                  setRound(0);
                  if (refItem.current) {
                    refItem.current.innerHTML = "";
                  }
                }}
              >
                Случайный выбор
              </button>
              <button
                onClick={() => {
                  setSelectMode(2);
                  setSelectModeName("Око за око");
                  setOpenModal(false);
                  setRound(0); // Начинаем игру с первого раунда
                  if (refItem.current) {
                      refItem.current.innerHTML = ""; // Очищаем таблицу
                  }
                }}
              >
                Око за око
              </button>
              <button
                onClick={() => {
                  setSelectMode(3);
                  setSelectModeName("Выигрышь всегда");
                  setOpenModal(false);
                  setRound(0); // Начинаем игру с первого раунда
                  if (refItem.current) {
                    refItem.current.innerHTML = ""; // Очищаем таблицу
                  }
                }}
              >
                Выигрышь всегда
              </button>
              <button
                onClick={() => {
                  setSelectMode(4);
                  setSelectModeName("Проигрышь всегда");
                  setOpenModal(false);
                  setRound(0); // Начинаем игру с первого раунда
                  if (refItem.current) {
                    refItem.current.innerHTML = ""; // Очищаем таблицу
                  }
                }}
              >
                Проигрышь всегда
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        {scoreUser > scoreComp ?
          <div className="game-container" style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <h1 style={{textAlign: "center"}}>Вы победили!</h1>
            <button onClick={stashOptions}>Реванш?</button>
          </div>
          : scoreUser < scoreComp ?
            <div className="game-container" style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
              <h1 style={{textAlign: "center"}}>Вы проиграли!</h1>
              <button onClick={stashOptions}>Реванш?</button>
            </div>
            : 
            <div className="game-container" style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
              <h1 style={{textAlign: "center"}}>Ничья!</h1>
              <button onClick={stashOptions}>Реванш?</button>
            </div>
        }
      </div>
    )
  }
}

export default App;