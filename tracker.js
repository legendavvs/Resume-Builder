const { useState, useEffect } = React;

// --- ДАНІ: ПОРАДИ (FAQ) ---
const tipsData = [
    {
        id: 1,
        question: "🤔 Як правильно писати 'Про себе'?",
        answer: "Пиши коротко (3-4 речення). Не пиши 'відповідальний та комунікабельний'. Краще: 'Front-end розробник із досвідом створення SPA на React. Захоплююсь UX/UI дизайном та оптимізацією коду'."
    },
    {
        id: 2,
        question: "📸 Яке фото обрати?",
        answer: "Фото має бути портретним, на світлому або нейтральному фоні. Посміхайся! Не використовуй селфі з дзеркала або фото з вечірок. Це перше, що бачить рекрутер."
    },
    {
        id: 3,
        question: "💼 Як описувати досвід?",
        answer: "Використовуй дієслова доконаного виду: не 'робив', а 'зробив', 'розробив', 'покращив'. Додавай цифри: 'Збільшив швидкість завантаження сайту на 20%'."
    },
    {
        id: 4,
        question: "🚫 Чого не треба писати?",
        answer: "Не вказуй повну домашню адресу (досить міста). Не пиши про школу, якщо ти вже в коледжі. Не додавай графік 'навичок' у відсотках (ніхто не знає HTML на 95%)."
    },
    {
        id: 5,
        question: "💻 Які навички важливі?",
        answer: "Пиши технології, якими реально володієш. Для Front-end це: HTML5, CSS3, JavaScript (ES6+), React, Git, Figma. Soft skills краще показувати через досвід, а не списком."
    }
];

// --- СТИЛІ ---
const styles = {
    floatingBtn: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#4f46e5',
        color: 'white',
        border: 'none',
        boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)',
        cursor: 'pointer',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        transition: 'transform 0.2s',
    },
    panel: {
        position: 'fixed',
        bottom: '90px',
        right: '20px',
        width: '340px', // Трохи ширше для тексту
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        padding: '0', // Прибрали паддінг контейнера
        zIndex: 9998,
        fontFamily: 'Inter, sans-serif',
        border: '1px solid #e2e8f0',
        animation: 'fadeIn 0.3s ease-out',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '500px'
    },
    // Стилі вкладок
    tabsHeader: {
        display: 'flex',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc'
    },
    tabBtn: (isActive) => ({
        flex: 1,
        padding: '15px',
        border: 'none',
        background: isActive ? 'white' : 'transparent',
        borderBottom: isActive ? '2px solid #4f46e5' : 'none',
        color: isActive ? '#4f46e5' : '#64748b',
        fontWeight: isActive ? 'bold' : 'normal',
        cursor: 'pointer',
        transition: 'all 0.2s'
    }),
    contentArea: {
        padding: '20px',
        overflowY: 'auto',
        maxHeight: '400px'
    },
    // Стилі чек-листа
    progressBar: {
        height: '6px',
        width: '100%',
        backgroundColor: '#f1f5f9',
        borderRadius: '3px',
        marginBottom: '20px',
        overflow: 'hidden'
    },
    progressFill: (percent) => ({
        height: '100%',
        width: `${percent}%`,
        backgroundColor: percent === 100 ? '#22c55e' : '#4f46e5',
        transition: 'width 0.5s ease'
    }),
    todoItem: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '12px',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '8px',
        transition: 'background 0.2s'
    },
    checkbox: { marginRight: '12px', width: '18px', height: '18px', cursor: 'pointer' },
    label: (done) => ({
        fontSize: '14px',
        color: done ? '#94a3b8' : '#334155',
        textDecoration: done ? 'line-through' : 'none',
        userSelect: 'none'
    }),
    // Стилі порад (Accordion)
    tipItem: {
        borderBottom: '1px solid #f1f5f9',
        marginBottom: '10px'
    },
    tipHeader: {
        padding: '10px 5px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
        color: '#1e293b',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    tipContent: {
        padding: '0 5px 15px 5px',
        fontSize: '13px',
        color: '#475569',
        lineHeight: '1.5'
    }
};

const JobAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('checklist'); // 'checklist' або 'tips'
    const [openTipId, setOpenTipId] = useState(null); // Яке питання відкрите

    // --- State Checklist ---
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Скласти структуру резюме', done: false },
        { id: 2, text: 'Додати якісне фото', done: false },
        { id: 3, text: 'Перевірити граматику', done: false },
        { id: 4, text: 'Зберегти PDF версію', done: false },
        { id: 5, text: 'Оновити LinkedIn профіль', done: false },
    ]);

    useEffect(() => {
        const saved = localStorage.getItem('react_tracker_data');
        if (saved) setTasks(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem('react_tracker_data', JSON.stringify(tasks));
    }, [tasks]);

    const toggleTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    const completedCount = tasks.filter(t => t.done).length;
    const progress = Math.round((completedCount / tasks.length) * 100);

    // Функція відкриття поради
    const toggleTip = (id) => {
        if (openTipId === id) setOpenTipId(null); // Закрити, якщо вже відкрито
        else setOpenTipId(id); // Відкрити нове
    };

    return (
        <React.Fragment>
            {/* Кнопка */}
            <button 
                style={styles.floatingBtn} 
                onClick={() => setIsOpen(!isOpen)}
                title="Асистент"
            >
                {isOpen ? '✕' : '💡'}
            </button>

            {/* Панель */}
            {isOpen && (
                <div style={styles.panel}>
                    
                    {/* Вкладки (Tabs) */}
                    <div style={styles.tabsHeader}>
                        <button 
                            style={styles.tabBtn(activeTab === 'checklist')} 
                            onClick={() => setActiveTab('checklist')}
                        >
                            Чек-лист
                        </button>
                        <button 
                            style={styles.tabBtn(activeTab === 'tips')} 
                            onClick={() => setActiveTab('tips')}
                        >
                            Поради
                        </button>
                    </div>

                    {/* Вміст: ЧЕК-ЛИСТ */}
                    {activeTab === 'checklist' && (
                        <div style={styles.contentArea}>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px', fontSize:'12px', color:'#64748b'}}>
                                <span>Прогрес</span>
                                <span>{progress}%</span>
                            </div>
                            <div style={styles.progressBar}>
                                <div style={styles.progressFill(progress)}></div>
                            </div>

                            {tasks.map(task => (
                                <div 
                                    key={task.id} 
                                    style={styles.todoItem}
                                    onClick={() => toggleTask(task.id)}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <input type="checkbox" checked={task.done} readOnly style={styles.checkbox} />
                                    <span style={styles.label(task.done)}>{task.text}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Вміст: ПОРАДИ (Accordion) */}
                    {activeTab === 'tips' && (
                        <div style={styles.contentArea}>
                            {tipsData.map(tip => (
                                <div key={tip.id} style={styles.tipItem}>
                                    <div 
                                        style={styles.tipHeader} 
                                        onClick={() => toggleTip(tip.id)}
                                    >
                                        <span>{tip.question}</span>
                                        <span>{openTipId === tip.id ? '−' : '+'}</span>
                                    </div>
                                    
                                    {openTipId === tip.id && (
                                        <div style={styles.tipContent}>
                                            {tip.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            <div style={{marginTop: '20px', padding: '10px', background: '#ecfdf5', borderRadius: '8px', fontSize: '12px', color: '#047857'}}>
                                🎓 <b>Лайфхак:</b> Використовуй різні шаблони (Minimal/Creative) для різних компаній.
                            </div>
                        </div>
                    )}

                </div>
            )}
        </React.Fragment>
    );
};

const rootElement = document.getElementById('react-job-assistant');
const root = ReactDOM.createRoot(rootElement);
root.render(<JobAssistant />);