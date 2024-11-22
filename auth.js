import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
    getDatabase,
    ref,
    set
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyB4DwEUsYBVWZIy68_SDJw8Z3_NAswNl-M",
    authDomain: "webprogramming-e9cb9.firebaseapp.com",
    databaseURL: "https://webprogramming-e9cb9-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "webprogramming-e9cb9",
    storageBucket: "webprogramming-e9cb9.firebasestorage.app",
    messagingSenderId: "1047928669829",
    appId: "1:1047928669829:web:af333892985b3a3e6c4bec"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// 儲存用戶資料到 Firebase Realtime Database
function saveUserInfoToDatabase(user) {
    const userRef = ref(database, `users/${user.uid}`);
    const lastLoginTime = new Date().toISOString();
    set(userRef, {
        displayName: user.displayName || "匿名使用者",
        email: user.email,
        photoURL: user.photoURL || "",
        lastLogin: lastLoginTime
    }).then(() => {
        displayUserInfo(user, lastLoginTime);
    }).catch((error) => {
        alert("資料儲存失敗：" + error.message);
    });
}

// 顯示用戶資訊
function displayUserInfo(user, lastLoginTime) {
    document.getElementById("user-info").style.display = "block";
    document.getElementById("login-form").style.display = "none";
    document.getElementById("register-form").style.display = "none";
    document.getElementById("profile-pic").src = user.photoURL || "https://via.placeholder.com/80";
    document.getElementById("user-name").textContent = user.displayName || "匿名使用者";
    document.getElementById("user-email").textContent = user.email;
    document.getElementById("last-login").textContent = `最後登入時間：${lastLoginTime}`;
}

// 登出
document.getElementById("logout-btn").addEventListener("click", () => {
    signOut(auth)
        .then(() => {
            document.getElementById("user-info").style.display = "none";
            document.getElementById("login-form").style.display = "block";
        })
        .catch((error) => {
            alert("登出失敗：" + error.message);
        });
});

// 切換到註冊表單
document.getElementById("switch-to-register-btn").addEventListener("click", () => {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("register-form").style.display = "block";
});

// 切換到登入表單
document.getElementById("switch-to-login-btn").addEventListener("click", () => {
    document.getElementById("register-form").style.display = "none";
    document.getElementById("login-form").style.display = "block";
});

// 註冊功能
document.getElementById("registrationForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    // 輸入驗證：檢查電子郵件和密碼格式
    if (!validateEmail(email)) {
        alert("請輸入有效的電子郵件格式！");
        return;
    }

    if (password.length < 6) {
        alert("密碼至少需 6 個字符！");
        return;
    }

    // 嘗試註冊新帳號
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            saveUserInfoToDatabase(userCredential.user);
            // 註冊成功後，顯示提示並清空表單
            alert("註冊成功！");
            document.getElementById("registrationForm").reset();
        })
        .catch((error) => {
            handleRegistrationError(error);  // 呼叫錯誤處理函式
        });
});

// 驗證電子郵件格式
function validateEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
}

// 註冊錯誤處理
function handleRegistrationError(error) {
    const errorCode = error.code;
    const customMessages = {
        'auth/email-already-in-use': "該電子郵件已經註冊過，請使用其他電子郵件。",
        'auth/invalid-email': "無效的電子郵件格式，請檢查並重新輸入。",
        'auth/weak-password': "密碼過於簡單，請選擇更強的密碼。",
        'auth/network-request-failed': "網絡請求失敗，請檢查網絡連接。",
    };

    // 根據錯誤代碼獲取對應的錯誤訊息
    const errorMessage = customMessages[errorCode] || "註冊失敗，請稍後再試！";
    alert(errorMessage);
}



// 登入功能
document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault(); // 防止表單默認提交，避免頁面刷新

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // 驗證電子郵件格式
    if (!isValidEmail(email)) {
        showAlert("請輸入有效的電子郵件格式！");
        return;
    }

    // 使用 Firebase 登入
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // 登入成功後，儲存使用者資訊並跳轉
            saveUserInfoToDatabase(userCredential.user);
            window.location.href = "/dashboard"; // 根據需要跳轉頁面
        })
        .catch(handleLoginError); // 使用 `handleLoginError` 來處理錯誤
});



// 驗證電子郵件格式
function isValidEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
}


// 登入錯誤處理函式
function handleLoginError(error) {
    const errorCode = error.code;  // 取得錯誤代碼
    const customMessages = {
        'auth/invalid-email': "無效的電子郵件格式！",
        'auth/user-not-found': "此電子郵件尚未註冊，請先註冊！",
        'auth/wrong-password': "密碼錯誤，請重新輸入！",

    };

    // 根據錯誤代碼獲取對應的錯誤訊息
    const errorMessage = customMessages[errorCode] || "登入發生錯誤，請稍後再試！";
    showAlert(errorMessage);  // 顯示錯誤訊息
}

// 顯示錯誤訊息的通用函式
function showAlert(message) {
    alert(message);  // 顯示錯誤訊息
}






// Google 登入功能
document.getElementById("google-login-btn").addEventListener("click", function () {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => {
            saveUserInfoToDatabase(result.user);
        })
        .catch((error) => {
            alert(error.message);
        });
});

// 監聽用戶狀態變化
onAuthStateChanged(auth, (user) => {
    if (user) {
        saveUserInfoToDatabase(user);
    }
});
