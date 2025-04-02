"use client"
import React, { useRef, useState, useEffect } from 'react';
import '../styles/globals.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import { motion } from 'framer-motion';


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
  const [defaultImageUser, setDefaultImageUser] = useState("/default_boy.png");
  const [defaultImageComp, setDefaultImageComp] = useState("/default_boy.png");
  const [defaultEmotionUser, setDefaultEmotionUser] = useState("fine");
  const [defaultEmotionComp, setDefaultEmotionComp] = useState("fine");

  const [gameData, setGameData] = useState([]);
  const [testAnswers, setTestAnswers] = useState({});

  const stashOptions = () => {
    setRound(0);
    setScoreUser(15);
    setScoreComp(15);
    setLastMove("");
    setCompLastMove("");
    setDefaultImageUser("/default_boy.png");
    setDefaultImageComp("/default_boy.png");
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

    console.log("selectMode", selectMode)

    if (selectMode === 1) {
      // Случайный выбор
      let random = Math.floor(Math.random() * 99)
      // console.log("random", random)
      computerMove = random <= 33 ? "Довериться" : random > 33 && random <= 66 ? "Обмануть" : "Пропустить ход";
      chekScored(yourMove, computerMove);
    } else if (selectMode === 2) {
      // Око за око (TFT - Tit for Tat)
      // В первом раунде сотрудничает, затем повторяет предыдущий ход игрока
      if (round === 0) {
        computerMove = "Довериться";
      } else {
        // Здесь нужно получить предыдущий ход игрока из таблицы
        // (реализация зависит от того, как вы храните историю ходов)
        //  Пока просто ставим случайный ход, чтобы не было ошибки
        computerMove = lastMove
        chekScored(yourMove, computerMove);
      }
    } else if (selectMode === 3) {
      // Выигрыш всегда (всегда обманывает)
      //computerMove = yourMove === "Довериться" ? "Довериться" : lastMove === "Пропустить ход" ? "Довериться" : "Довериться";
      let data = Math.random() * 10;
      if (data > 2) {
        computerMove = "Довериться";
      } else {
        computerMove = "Обмануть";
      }
      chekScored(yourMove, computerMove);
    } else if (selectMode === 4) {
      // Проигрыш всегда (всегда сотрудничает)
      // computerMove = lastMove === "Довериться" ? "Обмануть" : lastMove === "Пропустить ход" ? "Обмануть" : "Обмануть";
      let data = Math.random() * 10;
      if (data > 8) {
        computerMove = "Довериться";
      } else {
        computerMove = "Обмануть";
      }
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
    const newGameData = {round: round + 1, userChoise: yourMove, compChoise: computerMove};
    setGameData(prevData => [...prevData, newGameData]);

    // Добавляем строку в таблицу
    refItem.current.appendChild(newRow);

    setRound(round + 1);
    setLastMove(yourMove);
    setCompLastMove(computerMove);
  }

  const handleTestAnswer = (question, answer) => {
    setTestAnswers(prevAnswers => ({ ...prevAnswers, [question]: answer }));
  };

  const generateExcel = () => {
    // Создаем лист данных игры
    console.log("1")
    const wsGameData = XLSX.utils.json_to_sheet(gameData);

    // Создаем лист с ответами на тест
    const testData = [{ ...testAnswers }]; // Преобразуем объект в массив с одним объектом
    const wsTestData = XLSX.utils.json_to_sheet(testData);
    console.log("2")

    // Создаем книгу (workbook) и добавляем листы
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsGameData, "Game Data");
    XLSX.utils.book_append_sheet(wb, wsTestData, "Test Answers");
    console.log("3")

    // Генерируем файл XLSX
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    console.log("4")

    // Скачиваем файл
    saveAs(data, "game_data.xlsx");
  };

  const generateExcelAndSendEmail = async () => {
    // Создаем лист данных игры
    const wsGameData = XLSX.utils.json_to_sheet(gameData);

    // Создаем лист с ответами на тест
    const testData = [{ ...testAnswers }];
    const wsTestData = XLSX.utils.json_to_sheet(testData);

    // Создаем книгу и добавляем листы
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsGameData, "Game Data");
    XLSX.utils.book_append_sheet(wb, wsTestData, "Test Answers");

    // Генерируем файл XLSX в формате base64
    const excelBase64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });

    // Отправляем данные на API route
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          excelBase64: excelBase64,
          recipientEmail: "Pavel.Mosolov.02@mail.ru",
        }),
      });

      if (response.ok) {
        alert('Email sent successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };


  const handleStartClick = () => {
    if (age && gender) {
      setFirstStart(false);
      setGameStart(true);
      
      let mode = Math.floor(Math.random() * 4) + 1;
      let modeName = mode == 1 ? "Непредсказуемый" : mode == 2 ? "Око за око" : mode == 3 ? "В основном доверие" : "В основном обман"
      
      console.log(mode)

      setSelectMode(mode);
      setSelectModeName(modeName);
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

  const shangeImg = React.useCallback(() => { // Оберните в useCallback
    if (lastMove === "Довериться" && lastCompMove === "Обмануть") {
      setDefaultImageComp("/default_boy_win.png");
      setDefaultEmotionComp("angry");
      setDefaultImageUser("/default_boy_sad.png");
      setDefaultEmotionUser("sad");
    } else if (lastMove === "Обмануть" && lastCompMove === "Довериться") {
      setDefaultImageComp("/default_boy_sad.png");
      setDefaultEmotionComp("sad");
      setDefaultImageUser("/default_boy_win.png");
      setDefaultEmotionUser("angry");
    } else if (lastMove === "Обмануть" && lastCompMove === "Обмануть") {
      setDefaultImageComp("/default_boy_sad.png");
      setDefaultEmotionComp("sad");
      setDefaultImageUser("/default_boy_sad.png");
      setDefaultEmotionUser("sad");
    } else if (lastMove === "Довериться" && lastCompMove === "Довериться") {
      setDefaultImageComp("/default_boy_win.png");
      setDefaultEmotionComp("angry");
      setDefaultImageUser("/default_boy_win.png");
      setDefaultEmotionUser("angry");
    } else if (lastMove === "Пропустить ход" || lastCompMove === "Пропустить ход") {
      setDefaultImageComp("/default_boy.png");
      setDefaultEmotionComp("fine");
      setDefaultImageUser("/default_boy.png");
      setDefaultEmotionUser("fine");
    }
  }, [lastMove, lastCompMove, setDefaultImageComp, setDefaultImageUser]);


  useEffect(() => {
    if (isAnimating) {
      setDefaultImageComp("/default_boy_take_shoise.png")
      setDefaultImageUser("/default_boy_take_shoise.png")
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
            }, 700); // Время для ухода
            return () => clearTimeout(timer4);
          }, 500); // Время для возврата в исходный размер
          return () => clearTimeout(timer3);
        }, 500); // Время для увеличения
        return () => clearTimeout(timer2);
      }, 700); // Время появления
      return () => {
        clearTimeout(timer1)
      }
    }
  }, [isAnimating, shangeImg]);


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
                <h1>Дилемма узника: {selectModeName}</h1>
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
                      <React.Fragment>
                        {defaultEmotionUser === 'fine' ? 
                          <React.Fragment>
                            <div className='eye-men-one-1'></div>
                            <div className='eye-men-one-2'></div>
                            <div className='mouse-men-one'></div>
                          </React.Fragment>
                        : defaultEmotionUser === 'sad' ?
                          <React.Fragment>
                            <div className='eye-men-sad-1'>
                              <div className='tear-left'></div>
                              <div className='tear-left'></div>
                              <div className='tear-left'></div>
                              <div className='tear-left'></div>
                            </div>
                            <div className='eye-men-sad-2'>
                              <div className='tear-right'></div>
                              <div className='tear-right'></div>
                              <div className='tear-right'></div>
                              <div className='tear-right'></div>
                            </div>
                            <div className='mouse-men-sad'></div>
                          </React.Fragment>
                        : 
                          <React.Fragment>
                            <div className='eye-men-one-1'></div>
                            <div className='eye-men-one-2'></div>
                            <div className='eye-men-brow-1'></div>
                            <div className='eye-men-brow-2'></div>
                            <div className='mouse-men-one'></div>
                          </React.Fragment>
                        }
                        {/* <img src={defaultImageUser} alt=""/>  */}
                        {/* <Image width={120} height={??160} src={defaultImageUser} alt=""/> */}
                        <img src={defaultImageUser}/>
                      </React.Fragment>
                    </motion.div> 
                    <div className='animations-blocks-stone'>
                      <img src={"./stone.svg"}/>
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
                      <React.Fragment>
                        {defaultEmotionComp === 'fine' ? 
                          <React.Fragment>
                            <div className='eye-men-two-1'></div>
                            <div className='eye-men-two-2'></div>
                            <div className='mouse-men-two'></div>
                          </React.Fragment>
                        : defaultEmotionComp === 'sad' ?
                          <React.Fragment>
                            <div className='eye-men-sad-1'>
                              <div className='tear-left'></div>
                              <div className='tear-left'></div>
                              <div className='tear-left'></div>
                              <div className='tear-left'></div>
                            </div>
                            <div className='eye-men-sad-2'>
                              <div className='tear-right'></div>
                              <div className='tear-right'></div>
                              <div className='tear-right'></div>
                              <div className='tear-right'></div>
                            </div>
                            <div className='mouse-men-sad'></div>
                          </React.Fragment>
                        : 
                          <React.Fragment>
                            <div className='eye-men-two-1'></div>
                            <div className='eye-men-two-2'></div>
                            <div className='eye-men-brow-1'></div>
                            <div className='eye-men-brow-2'></div>
                            <div className='mouse-men-two'></div>
                          </React.Fragment>
                        }
                        <img src={defaultImageComp}/>
                      </React.Fragment>
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
                        <th>Ход противника</th>
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
        <div class="question">
            <p><strong>1.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q1" value="A" required onChange={(e) => handleTestAnswer("Q1", e.target.value)}/> 
                    А. Иногда я предоставляю возможность другим взять на себя ответственность за решение спорного вопроса.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q1" value="B" required onChange={(e) => handleTestAnswer("Q1", e.target.value)}/> 
                    Б. Чем обсуждать то, в чем мы расходимся, я стараюсь обратить внимание на то, с чем мы оба не согласны.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 2 --> */}
        <div class="question">
            <p><strong>2.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q2" value="A" required onChange={(e) => handleTestAnswer("Q2", e.target.value)}/> 
                    А. Я стараюсь найти компромиссное решение.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q2" value="B" required onChange={(e) => handleTestAnswer("Q2", e.target.value)}/> 
                    Б. Я пытаюсь уладить дело, учитывая интересы другого и мои.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 3 --> */}
        <div class="question">
            <p><strong>3.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q3" value="A" required onChange={(e) => handleTestAnswer("Q3", e.target.value)}/> 
                    А. Обычно я настойчиво стремлюсь добиться своего.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q3" value="B" required onChange={(e) => handleTestAnswer("Q3", e.target.value)}/> 
                    Б. Я стараюсь успокоить другого и сохранить наши отношения.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 4 --> */}
        <div class="question">
            <p><strong>4.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q4" value="A" required onChange={(e) => handleTestAnswer("Q4", e.target.value)}/> 
                    А. Я стараюсь найти компромиссное решение.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q4" value="B" required onChange={(e) => handleTestAnswer("Q4", e.target.value)}/> 
                    Б. Иногда я жертвую своими собственными интересами ради интересов другого человека.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 5 --> */}
        <div class="question">
            <p><strong>5.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q5" value="A" required onChange={(e) => handleTestAnswer("Q5", e.target.value)}/> 
                    А. Улаживая спорную ситуацию, я все время стараюсь найти поддержку у другого.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q5" value="B" required onChange={(e) => handleTestAnswer("Q5", e.target.value)}/> 
                    Б. Я стараюсь сделать все, чтобы избежать напряженности.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 6 --> */}
        <div class="question">
            <p><strong>6.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q6" value="A" required onChange={(e) => handleTestAnswer("Q6", e.target.value)}/> 
                    А. Я пытаюсь избежать возникновения неприятностей для себя.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q6" value="B" required onChange={(e) => handleTestAnswer("Q6", e.target.value)}/> 
                    Б. Я стараюсь добиться своего.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 7 --> */}
        <div class="question">
            <p><strong>7.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q7" value="A" required onChange={(e) => handleTestAnswer("Q7", e.target.value)}/> 
                    А. Я стараюсь отложить решение спорного вопроса с тем, чтобы со временем решить его окончательно.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q7" value="B" required onChange={(e) => handleTestAnswer("Q7", e.target.value)}/> 
                    Б. Я считаю возможным уступить, чтобы добиться другого.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 8 --> */}
        <div class="question">
            <p><strong>8.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q8" value="A" required onChange={(e) => handleTestAnswer("Q8", e.target.value)}/> 
                    А. Обычно я настойчиво стремлюсь добиться своего.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q8" value="B" required onChange={(e) => handleTestAnswer("Q8", e.target.value)}/> 
                    Б. Я первым делом стараюсь ясно определить то, в чем состоят все затронутые интересы и вопросы.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 9 --> */}
        <div class="question">
            <p><strong>9.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q9" value="A" required onChange={(e) => handleTestAnswer("Q9", e.target.value)}/> 
                    А. Думаю, что не всегда стоит волноваться из-за каких-то возникающих разногласий.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q9" value="B" required onChange={(e) => handleTestAnswer("Q9", e.target.value)}/> 
                    Б. Я предпринимаю усилия, чтобы добиться своего.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 10 --> */}
        <div class="question">
            <p><strong>10.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q10" value="A" required onChange={(e) => handleTestAnswer("Q10", e.target.value)}/> 
                    А. Я твердо стремлюсь достичь своего.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q10" value="B" required onChange={(e) => handleTestAnswer("Q10", e.target.value)}/> 
                    Б. Я пытаюсь найти компромиссное решение.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 11 --> */}
        <div class="question">
            <p><strong>11.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q11" value="A" required onChange={(e) => handleTestAnswer("Q11", e.target.value)}/> 
                    А. Первым делом я стараюсь ясно определить то, в чем состоят все затронутые интересы и вопросы.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q11" value="B" required onChange={(e) => handleTestAnswer("Q11", e.target.value)}/> 
                    Б. Я стараюсь успокоить другого и главным образом сохранить наши отношения.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 12 --> */}
        <div class="question">
            <p><strong>12.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q12" value="A" required onChange={(e) => handleTestAnswer("Q12", e.target.value)}/> 
                    А. Зачастую я избегаю занимать позицию, которая может вызвать споры.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q12" value="B" required onChange={(e) => handleTestAnswer("Q12", e.target.value)}/> 
                    Б. Я даю возможность другому в чем-то остаться при своем мнении, если он также идет мне навстречу.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 13 --> */}
        <div class="question">
            <p><strong>13.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q13" value="A" required onChange={(e) => handleTestAnswer("Q13", e.target.value)}/> 
                    А. Я предлагаю среднюю позицию.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q13" value="B" required onChange={(e) => handleTestAnswer("Q13", e.target.value)}/> 
                    Б. Я настаиваю, чтобы было сделано по-моему.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 14 --> */}
        <div class="question">
            <p><strong>14.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q14" value="A" required onChange={(e) => handleTestAnswer("Q14", e.target.value)}/> 
                    А. Я сообщаю другому свою точку зрения и спрашиваю о его взглядах.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q14" value="B" required onChange={(e) => handleTestAnswer("Q14", e.target.value)}/> 
                    Б. Я пытаюсь показать другому логику и преимущества моих взглядов.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 15 --> */}
        <div class="question">
            <p><strong>15.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q15" value="A" required onChange={(e) => handleTestAnswer("Q15", e.target.value)}/> 
                    А. Я стараюсь успокоить другого и, главным образом, сохранить наши отношения.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q15" value="B" required onChange={(e) => handleTestAnswer("Q15", e.target.value)}/> 
                    Б. Я стараюсь сделать все необходимое, чтобы избежать напряженности.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 16 --> */}
        <div class="question">
            <p><strong>16.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q16" value="A" required onChange={(e) => handleTestAnswer("Q16", e.target.value)}/> 
                    А. Я стараюсь не задеть чувств другого.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q16" value="B" required onChange={(e) => handleTestAnswer("Q16", e.target.value)}/> 
                    Б. Я пытаюсь убедить другого в преимуществах моей позиции.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 17 --> */}
        <div class="question">
            <p><strong>17.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q17" value="A" required onChange={(e) => handleTestAnswer("Q17", e.target.value)}/> 
                    А. Обычно я настойчиво стараюсь добиться своего.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q17" value="B" required onChange={(e) => handleTestAnswer("Q17", e.target.value)}/> 
                    Б. Я стараюсь сделать все, чтобы избежать бесполезной напряженности.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 18 --> */}
        <div class="question">
            <p><strong>18.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q18" value="A" required onChange={(e) => handleTestAnswer("Q18", e.target.value)}/> 
                    А. Если это сделает другого счастливым, я дам ему возможность настоять на своем.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q18" value="B" required onChange={(e) => handleTestAnswer("Q18", e.target.value)}/> 
                    Б. Я даю возможность другому в чем-то остаться при своем мнении, если он также идет мне навстречу.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 19 --> */}
        <div class="question">
            <p><strong>19.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q19" value="A" required onChange={(e) => handleTestAnswer("Q19", e.target.value)}/> 
                    А. Первым делом я стараюсь ясно определить то, в чем состоят все затронутые интересы и спорные вопросы.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q19" value="B" required onChange={(e) => handleTestAnswer("Q19", e.target.value)}/> 
                    Б. Я стараюсь отложить решение спорного вопроса с тем, чтобы со временем решить его окончательно.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 20 --> */}
        <div class="question">
            <p><strong>20.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q20" value="A" required onChange={(e) => handleTestAnswer("Q20", e.target.value)}/> 
                    А. Я пытаюсь немедленно преодолеть наши разногласия.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q20" value="B" required onChange={(e) => handleTestAnswer("Q20", e.target.value)}/> 
                    Б. Я стремлюсь к лучшему сочетанию выгод и потерь для всех.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 21 --> */}
        <div class="question">
            <p><strong>21.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q21" value="A" required onChange={(e) => handleTestAnswer("Q21", e.target.value)}/> 
                    А. Ведя переговоры, я стараюсь быть внимательным к желаниям другого.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q21" value="B" required onChange={(e) => handleTestAnswer("Q21", e.target.value)}/> 
                    Б. Я всегда склоняюсь к прямому обсуждению проблемы.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 22 --> */}
        <div class="question">
            <p><strong>22.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q22" value="A" required onChange={(e) => handleTestAnswer("Q22", e.target.value)}/> 
                    А. Я пытаюсь найти позицию, которая находится посредине между моей позицией и точкой зрения другого человека.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q22" value="B" required onChange={(e) => handleTestAnswer("Q22", e.target.value)}/> 
                    Б. Я отстаиваю свои желания.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 23 --> */}
        <div class="question">
            <p><strong>23.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q23" value="A" required onChange={(e) => handleTestAnswer("Q23", e.target.value)}/> 
                    А. Я озабочен тем, чтобы удовлетворить желания каждого.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q23" value="B" required onChange={(e) => handleTestAnswer("Q23", e.target.value)}/> 
                    Б. Иногда я представляю возможность другим взять на себя ответственность за решение спорного вопроса.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 24 --> */}
        <div class="question">
            <p><strong>24.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q24" value="A" required onChange={(e) => handleTestAnswer("Q24", e.target.value)}/> 
                    А. Если позиция другого кажется ему очень важной, я постараюсь пойти навстречу его желаниям.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q24" value="B" required onChange={(e) => handleTestAnswer("Q24", e.target.value)}/> 
                    Б. Я стараюсь убедить другого прийти к компромиссу.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 25 --> */}
        <div class="question">
            <p><strong>25.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q25" value="A" required onChange={(e) => handleTestAnswer("Q25", e.target.value)}/> 
                    А. Я пытаюсь доказать другому логику и преимущества моих взглядов.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q25" value="B" required onChange={(e) => handleTestAnswer("Q25", e.target.value)}/> 
                    Б. Ведя переговоры, я стараюсь быть внимательным к желаниям другого.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 26 --> */}
        <div class="question">
            <p><strong>26.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q26" value="A" required onChange={(e) => handleTestAnswer("Q26", e.target.value)}/> 
                    А. Я предлагаю среднюю позицию.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q26" value="B" required onChange={(e) => handleTestAnswer("Q26", e.target.value)}/> 
                    Б. Я почти всегда озабочен тем, чтобы удовлетворить желания каждого из нас.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 27 --> */}
        <div class="question">
            <p><strong>27.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q27" value="A" required onChange={(e) => handleTestAnswer("Q27", e.target.value)}/> 
                    А. Я избегаю позиции, которая может вызвать споры.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q27" value="B" required onChange={(e) => handleTestAnswer("Q27", e.target.value)}/> 
                    Б. Если это сделает другого счастливым, я дам ему возможность настоять на своем.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 28 --> */}
        <div class="question">
            <p><strong>28.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q28" value="A" required onChange={(e) => handleTestAnswer("Q28", e.target.value)}/> 
                    А. Обычно я настойчиво стремлюсь добиться своего.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q28" value="B" required onChange={(e) => handleTestAnswer("Q28", e.target.value)}/> 
                    Б. Улаживая ситуацию, я стараюсь найти поддержку у другого.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 29 --> */}
        <div class="question">
            <p><strong>29.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q29" value="A" required onChange={(e) => handleTestAnswer("Q29", e.target.value)}/> 
                    А. Я предлагаю среднюю позицию.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q29" value="B" required onChange={(e) => handleTestAnswer("Q29", e.target.value)}/> 
                    Б. Думаю, что не всегда стоит волноваться из-за каких-то возникающих разногласий.
                </label>
            </div>
        </div>

        {/* <!-- Вопрос 30 --> */}
        <div class="question">
            <p><strong>30.</strong></p>
            <div class="option">
                <label>
                    <input type="radio" name="Q30" value="A" required onChange={(e) => handleTestAnswer("Q2", e.target.value)}/> 
                    А. Я стараюсь не задеть чувств другого.
                </label>
            </div>
            <div class="option">
                <label>
                    <input type="radio" name="Q30" value="B" required onChange={(e) => handleTestAnswer("Q2", e.target.value)}/> 
                    Б. Я всегда занимаю такую позицию в спорном вопросе, чтобы мы с другим заинтересованным человеком могли добиться успеха.
                </label>
            </div>
        </div>

        
        <button type="button" onClick={generateExcelAndSendEmail}>Закончить</button>

        {/* {scoreUser > scoreComp ?
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
        } */}
      </div>
    )
  }
}

export default App;


// import React, { useState } from 'react';

// export default function MainPage() {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [message, setMessage] = useState('');
//   const [status, setStatus] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setStatus('Sending...');

//     try {
//       const response = await fetch('./api/send-email', {  // URL вашего API route
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ name, email, message }),
//       });

//       if (response.ok) {
//         setStatus('Email sent successfully!');
//         setName('');
//         setEmail('');
//         setMessage('');
//       } else {
//         const errorData = await response.json();
//         setStatus(`Error: ${errorData.message}`);
//       }
//     } catch (error) {
//       setStatus(`Error: ${error}`);
//     }
//   };

//   return (
//     <div>
//       <form onSubmit={handleSubmit}>
//         <div>
//           <label htmlFor="name">Name:</label>
//           <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
//         </div>
//         <div>
//           <label htmlFor="email">Email:</label>
//           <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//         </div>
//       </form>
//       <button onClick={handleSubmit}>ffff</button>
//     </div>
//   );
// }