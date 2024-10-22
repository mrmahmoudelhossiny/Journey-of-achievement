// عرض القسم المطلوب
function showSection(sectionId) {
    // إخفاء جميع الأقسام
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    // عرض القسم النشط
    document.getElementById(sectionId).classList.add('active');
}

// استرجاع البيانات المحفوظة عند التحميل
window.onload = function() {
    loadTasks();
    loadBudget();
    loadGoals();
    showSection('tasks'); // عرض القسم الافتراضي عند التحميل
    updateDisplay(); // تحديث عرض الميزانية وعدد المهام غير المنجزة
};

// المهام اليومية
function addTask() {
    const taskInput = document.getElementById("taskInput").value;
    if (taskInput) {
        let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        tasks.push({ text: taskInput, completed: false });
        localStorage.setItem("tasks", JSON.stringify(tasks));
        document.getElementById("taskInput").value = "";
        loadTasks();
        showCompletionMessage("تمت إضافة المهمة بنجاح! أنت رائع!");
        updateDisplay();
    }
}

function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";
    tasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.textContent = task.text;
        li.className = task.completed ? "completed" : "";
        
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.className = "checkbox";
        checkbox.onclick = () => toggleTaskCompletion(index);
        
        li.prepend(checkbox);
        taskList.appendChild(li);
    });
    updateRemainingTasksCount(); // تحديث عدد المهام غير المنجزة
}

function toggleTaskCompletion(index) {
    let tasks = JSON.parse(localStorage.getItem("tasks"));
    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks();
    if (tasks[index].completed) {
        showCompletionMessage("أحسنت! لقد أنجزت مهمة بنجاح.");
    }
    updateDisplay(); // تحديث عرض الميزانية وعدد المهام
}

function deleteCompletedTasks() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks = tasks.filter(task => !task.completed);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks();
    updateDisplay(); // تحديث عرض الميزانية وعدد المهام
}

function deleteAllTasks() {
    localStorage.removeItem("tasks");
    loadTasks();
    updateDisplay(); // تحديث عرض الميزانية وعدد المهام
}

// الميزانية
function setInitialBudget() {
    const initialBudget = parseFloat(document.getElementById("initialBudgetInput").value);
    if (!isNaN(initialBudget)) {
        localStorage.setItem("totalBalance", initialBudget);
        localStorage.setItem("transactions", JSON.stringify([]));
        document.getElementById("initialBudgetSection").style.display = "none";
        document.getElementById("transactionSection").style.display = "block";
        loadBudget();
    }
}

function loadBudget() {
    let totalBalance = parseFloat(localStorage.getItem("totalBalance")) || 0;
    const balanceElement = document.getElementById("totalBalance");
    balanceElement.textContent = totalBalance + " EGP ";
    balanceElement.className = totalBalance < 500 ? "balance red" : "balance green";
}

// الأهداف
function addMainGoal() {
    const mainGoalInput = document.getElementById("mainGoalInput").value;
    if (mainGoalInput) {
        let mainGoals = JSON.parse(localStorage.getItem("mainGoals")) || [];
        mainGoals.push(mainGoalInput);
        localStorage.setItem("mainGoals", JSON.stringify(mainGoals));
        document.getElementById("mainGoalInput").value = "";
        loadGoals();
    }
}

function loadGoals() {
    let mainGoals = JSON.parse(localStorage.getItem("mainGoals")) || [];
    const goalList = document.getElementById("subGoalList");
    goalList.innerHTML = ""; // إفراغ القائمة الحالية

    // عرض الأهداف الرئيسية
    mainGoals.forEach(goal => {
        const li = document.createElement("li");
        li.textContent = goal;
        goalList.appendChild(li);
    });

    // تحديث عرض الميزانية الحالية وعدد المهام
    updateDisplay();
}

// تحديث عدد المهام غير المنجزة
function updateRemainingTasksCount() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const remainingTasksCount = tasks.filter(task => !task.completed).length;
    document.getElementById("remainingTasksCount").textContent = remainingTasksCount;
}

// إضافة معاملة (صرف أو إضافة)
function addTransaction(type) {
    const amountInput = document.getElementById("amountInput");
    const noteInput = document.getElementById("noteInput");
    const amount = parseFloat(amountInput.value);
    const note = noteInput.value;

    if (!isNaN(amount) && amount > 0) {
        let totalBalance = parseFloat(localStorage.getItem("totalBalance")) || 0;
        let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

        // تحديد ما إذا كانت المعاملة هي صرف أو إضافة
        const transactionType = type === 'add' ? 'add' : 'spend';
        const transactionAmount = transactionType === 'add' ? amount : -amount;

        // تحديث المبلغ الكلي
        totalBalance += transactionAmount;
        localStorage.setItem("totalBalance", totalBalance);

        // إضافة المعاملة إلى قائمة المعاملات
        transactions.push({
            type: transactionType,
            amount: amount,
            note: note,
            date: new Date().toLocaleString()
        });
        localStorage.setItem("transactions", JSON.stringify(transactions));

        // إعادة تعيين المدخلات
        amountInput.value = "";
        noteInput.value = "";

        // تحميل البيانات المحدّثة
        loadBudget();
        loadTransactions();

        // عرض رسالة إنجاز
        if (transactionType === 'add') {
            showCompletionMessage("مبروك! لقد أضفت مبلغاً جديداً. استمر في توفير المال!");
        } else {
            showCompletionMessage("تم تسجيل الصرف بنجاح.");
        }
    }
}

// تحميل قائمة المعاملات
function loadTransactions() {
    const transactionList = document.getElementById("transactionList");
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    transactionList.innerHTML = "";

    transactions.forEach(transaction => {
        const li = document.createElement("li");
        li.className = `transaction ${transaction.type}`;
        li.textContent = `${transaction.date} - ${transaction.type === 'add' ? 'إضافة' : 'صرف'}: ${transaction.amount} جنيه - ملاحظة: ${transaction.note || 'لا توجد ملاحظات'}`;
        transactionList.appendChild(li);
    });
}

// تحديث عرض المبلغ الكلي واللون حسب القيمة
function updateDisplay() {
    loadBudget();
    updateRemainingTasksCount();
}
function loadBudget() {
    let totalBalance = parseFloat(localStorage.getItem("totalBalance")) || 0;
    const balanceElement = document.getElementById("totalBalance");
    balanceElement.textContent = totalBalance + " EGP "; // تأكد من عرض الميزانية بشكل صحيح
    balanceElement.className = totalBalance < 500 ? "balance red" : "balance green";
    
    // تحديث الميزانية الحالية في قسم الأهداف
    document.getElementById("currentBudgetDisplay").textContent = totalBalance + " EGP ";
    
    loadTransactions();
}
function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    let completedTasks = 0; // عداد للمهام المنجزة

    tasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.textContent = task.text;
        li.className = task.completed ? "completed" : "";
        
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.className = "checkbox";
        checkbox.onclick = () => {
            toggleTaskCompletion(index);
            // حساب نسبة التقدم بعد تغيير حالة المهمة
            updateProgressPercentage();
        };
        
        li.prepend(checkbox);
        taskList.appendChild(li);
        
        if (task.completed) {
            completedTasks++; // زيادة عداد المهام المنجزة
        }
    });

    // تحديث نسبة التقدم
    updateProgressPercentage();
}

// دالة لحساب نسبة التقدم
function updateProgressPercentage() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;

    const progressPercentage = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
    
    // تحديث عرض نسبة التقدم في القسم
    document.getElementById("progressPercentage").textContent = Math.round(progressPercentage);
}
// مصفوفة تحتوي على 10 نصوص تشجيعية
const encouragingMessages = [
    "استمر في السعي نحو أهدافك، أنت على الطريق الصحيح!",
    "لا تتوقف، كل خطوة صغيرة تقربك من النجاح!",
    "أنت قادر على تحقيق كل ما تطمح إليه!",
    "واصل العمل الجاد، فالمثابرة هي مفتاح النجاح!",
    "كل يوم هو فرصة جديدة لتحقيق أحلامك!",
    "لا تنسى أن تأخذ وقتًا للاحتفال بإنجازاتك!",
    "تقدمك اليوم هو إنجازك غدًا!",
    "حافظ على الإيجابية، فقد تكون أقرب مما تتصور!",
    "كل جهد تبذله اليوم سيكون له تأثير كبير غدًا!",
    "إستمر، فكل خطوة تقربك من أهدافك الكبيرة!"
];

// دالة لتحديث النص التشجيعي
function updateGoalMessage() {
    const randomIndex = Math.floor(Math.random() * encouragingMessages.length);
    const goalMessage = document.getElementById("goalMessage");
    goalMessage.textContent = encouragingMessages[randomIndex];
}

// استدعاء الدالة عند تحميل الصفحة
window.onload = function() {
    loadTasks();
    loadBudget();
    loadGoals();
    showSection('tasks'); // عرض القسم الافتراضي عند التحميل
    updateDisplay(); // تحديث عرض الميزانية وعدد المهام غير المنجزة
    updateGoalMessage(); // تحديث الرسالة التشجيعية
};

// يمكنك أيضًا استدعاء الدالة كل فترة لتغيير الرسالة
setInterval(updateGoalMessage, 5 * 60 * 60 * 1000); // تغيير النص كل 5 ثوانٍ
