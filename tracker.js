const { useState, useEffect } = React;

// --- ДАНІ: ПОРАДИ (FAQ) ---
const tipsData = [
    { id: 1, question: "🤔 Як писати 'Про себе'?", answer: "Коротко (3-4 речення). Хто ти, твій досвід та чого прагнеш. Наприклад: 'Front-end розробник із досвідом React. Прагну створювати зручні інтерфейси'." },
    { id: 2, question: "📸 Вимоги до фото", answer: "Нейтральний фон, гарне освітлення, діловий стиль. Посмішка обов'язкова! Це викликає довіру." },
    { id: 3, question: "💼 Як описати досвід?", answer: "Використовуй сильні дієслова: 'Розробив', 'Оптимізував', 'Запустив'. Додавай цифри: 'Пришвидшив завантаження на 20%'." },
    { id: 4, question: "🚫 Стоп-слова", answer: "Уникай кліше: 'комунікабельний', 'стресостійкий'. Краще покажи це через реальні кейси." }
];

// --- СТИЛІ ---
const styles = {
    floatingBtn: {
        position: 'fixed', bottom: '20px', right: '20px', width: '60px', height: '60px',
        borderRadius: '50%', backgroundColor: '#4f46e5', color: 'white', border: 'none',
        boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)', cursor: 'pointer', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', transition: 'transform 0.2s',
    },
    panel: {
        position: 'fixed', bottom: '90px', right: '20px', width: '350px',
        backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', padding: '0', zIndex: 9998,
        fontFamily: 'Inter, sans-serif', border: '1px solid #e2e8f0', animation: 'fadeIn 0.3s ease-out', overflow: 'hidden', display: 'flex',
        flexDirection: 'column', maxHeight: '600px'
    },
    tabsHeader: { display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' },
    tabBtn: (isActive) => ({
        flex: 1, padding: '12px', border: 'none', background: isActive ? 'white' : 'transparent',
        borderBottom: isActive ? '2px solid #4f46e5' : 'none', color: isActive ? '#4f46e5' : '#64748b',
        fontWeight: isActive ? 'bold' : 'normal', cursor: 'pointer', fontSize: '13px'
    }),
    contentArea: { padding: '20px', overflowY: 'auto', maxHeight: '500px' },
    progressBar: { height: '6px', width: '100%', backgroundColor: '#f1f5f9', borderRadius: '3px', marginBottom: '20px' },
    progressFill: (percent) => ({ height: '100%', width: `${percent}%`, backgroundColor: percent === 100 ? '#22c55e' : '#4f46e5', transition: 'width 0.5s ease' }),
    todoItem: { display: 'flex', alignItems: 'center', marginBottom: '12px', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'background 0.2s' },
    checkbox: { marginRight: '12px', width: '18px', height: '18px', cursor: 'pointer' },
    label: (done) => ({ fontSize: '14px', color: done ? '#94a3b8' : '#334155', textDecoration: done ? 'line-through' : 'none' }),
    tipItem: { borderBottom: '1px solid #f1f5f9', marginBottom: '10px' },
    tipHeader: { padding: '10px 5px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', color: '#1e293b', display: 'flex', justifyContent: 'space-between' },
    tipContent: { padding: '0 5px 15px 5px', fontSize: '13px', color: '#475569', lineHeight: '1.5' },
    inputGroup: { marginBottom: '12px' },
    inputLabel: { display: 'block', fontSize: '12px', marginBottom: '4px', color: '#64748b' },
    input: { width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' },
    generatedBox: { background: '#f1f5f9', padding: '10px', borderRadius: '8px', fontSize: '12px', color: '#334155', lineHeight: '1.5', marginTop: '15px', whiteSpace: 'pre-wrap', border: '1px solid #e2e8f0' },
    copyBtn: { marginTop: '10px', width: '100%', padding: '8px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }
};

const JobAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('checklist'); 
    const [openTipId, setOpenTipId] = useState(null);

    // Дані користувача з основного резюме
    const [userData, setUserData] = useState({ name: '', title: '', skills: '' });

    // Checklist Logic
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Структура резюме', done: false },
        { id: 2, text: 'Фотографія', done: false },
        { id: 3, text: 'Перевірка помилок', done: false },
        { id: 4, text: 'Зберегти PDF', done: false },
        { id: 5, text: 'LinkedIn профіль', done: false },
    ]);

    // Generator Logic
    const [letterData, setLetterData] = useState({ recruiter: '', company: '', position: '' });
    const [copyStatus, setCopyStatus] = useState('Копіювати текст');

    // Init Data
    useEffect(() => {
        const savedTasks = localStorage.getItem('react_tracker_data');
        if (savedTasks) setTasks(JSON.parse(savedTasks));
    }, []);

    // Оновлюємо дані при відкритті віджета або перемиканні на вкладку "Лист"
    useEffect(() => {
        if (isOpen || activeTab === 'letter') {
            const rawResume = localStorage.getItem('cv_ultra_final_v2'); // Ключ з script.js
            if (rawResume) {
                const parsed = JSON.parse(rawResume);
                setUserData({
                    name: parsed.personal.name || '[Ваше Ім\'я]',
                    title: parsed.personal.title || '[Ваша Посада]',
                    skills: parsed.skills || '[Ваші навички]'
                });
            }
        }
    }, [isOpen, activeTab]);

    useEffect(() => {
        localStorage.setItem('react_tracker_data', JSON.stringify(tasks));
    }, [tasks]);

    const toggleTask = (id) => setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
    const toggleTip = (id) => setOpenTipId(openTipId === id ? null : id);
    const completedCount = tasks.filter(t => t.done).length;
    const progress = Math.round((completedCount / tasks.length) * 100);

    // --- РОЗУМНА ГЕНЕРАЦІЯ ЛИСТА ---
    const generateLetter = () => {
        const { recruiter, company, position } = letterData;
        
        // Використовуємо дані з форми або з резюме
        const rName = recruiter ? recruiter : 'Hiring Manager';
        const targetPos = position ? position : userData.title; // Якщо не ввів вакансію, беремо з резюме
        const cName = company ? `в компанії ${company}` : '';
        
        return `Вітаю, ${rName}!

Мене звати ${userData.name}, і я — ${userData.title}. Пишу Вам, щоб висловити свою зацікавленість у вакансії ${targetPos} ${cName}.

Маю релевантний досвід та впевнено володію такими технологіями, як: ${userData.skills}. Я швидко вчуся та готовий приносити користь Вашій команді з першого дня.

У доданому файлі — моє резюме. Буду радий поспілкуватися особисто та обговорити деталі.

З повагою,
${userData.name}`;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generateLetter());
        setCopyStatus('Скопійовано! ✅');
        setTimeout(() => setCopyStatus('Копіювати текст'), 2000);
    };

    return (
        <React.Fragment>
            <button style={styles.floatingBtn} onClick={() => setIsOpen(!isOpen)} title="Помічник">
                {isOpen ? '✕' : '🚀'}
            </button>

            {isOpen && (
                <div style={styles.panel}>
                    <div style={styles.tabsHeader}>
                        <button style={styles.tabBtn(activeTab === 'checklist')} onClick={() => setActiveTab('checklist')}>Трекер</button>
                        <button style={styles.tabBtn(activeTab === 'tips')} onClick={() => setActiveTab('tips')}>Поради</button>
                        <button style={styles.tabBtn(activeTab === 'letter')} onClick={() => setActiveTab('letter')}>Лист</button>
                    </div>

                    {/* 1. CHECKLIST */}
                    {activeTab === 'checklist' && (
                        <div style={styles.contentArea}>
                            <div style={styles.progressBar}><div style={styles.progressFill(progress)}></div></div>
                            {tasks.map(task => (
                                <div key={task.id} style={styles.todoItem} onClick={() => toggleTask(task.id)}
                                     onMouseEnter={(e)=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                                    <input type="checkbox" checked={task.done} readOnly style={styles.checkbox} />
                                    <span style={styles.label(task.done)}>{task.text}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 2. TIPS */}
                    {activeTab === 'tips' && (
                        <div style={styles.contentArea}>
                            {tipsData.map(tip => (
                                <div key={tip.id} style={styles.tipItem}>
                                    <div style={styles.tipHeader} onClick={() => toggleTip(tip.id)}>
                                        <span>{tip.question}</span><span>{openTipId === tip.id ? '−' : '+'}</span>
                                    </div>
                                    {openTipId === tip.id && <div style={styles.tipContent}>{tip.answer}</div>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 3. SMART LETTER GENERATOR */}
                    {activeTab === 'letter' && (
                        <div style={styles.contentArea}>
                            <div style={{fontSize: '12px', color: '#64748b', marginBottom: '15px', background:'#f0fdf4', padding:'8px', borderRadius:'6px', border:'1px solid #bbf7d0', color:'#166534'}}>
                                ⚡ Дані (Ім'я, Навички) підтягнуті з твого резюме автоматично.
                            </div>
                            
                            <div style={styles.inputGroup}>
                                <label style={styles.inputLabel}>Кому (Рекрутер)</label>
                                <input style={styles.input} placeholder="Олена / HR" 
                                       value={letterData.recruiter} onChange={(e) => setLetterData({...letterData, recruiter: e.target.value})} />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.inputLabel}>Вакансія (або залиш пустим)</label>
                                <input style={styles.input} placeholder={userData.title || "Frontend Dev"} 
                                       value={letterData.position} onChange={(e) => setLetterData({...letterData, position: e.target.value})} />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.inputLabel}>Компанія</label>
                                <input style={styles.input} placeholder="Google / SoftServe" 
                                       value={letterData.company} onChange={(e) => setLetterData({...letterData, company: e.target.value})} />
                            </div>

                            <div style={styles.generatedBox}>
                                {generateLetter()}
                            </div>
                            
                            <button style={styles.copyBtn} onClick={handleCopy}>
                                {copyStatus}
                            </button>
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