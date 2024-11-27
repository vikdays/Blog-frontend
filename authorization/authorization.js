document.getElementById('login-btn').addEventListener('click', handleLoginFormSubmit);
const form = document.getElementById('form');
const email = document.getElementById('email');
const password = document.getElementById('password');

form.addEventListener('submit', e => {
    e.preventDefault();

    validateInputs();
});

const setError = (element, message) => {
    const inputControl = element.parentElement;
    console.log('Input Control:', inputControl);
    const errorDisplay = inputControl.querySelector('.error');
    console.log('Error Display:', errorDisplay);

    errorDisplay.innerText = message;
    inputControl.classList.add('error');
    inputControl.classList.remove('success')
}

const setSuccess = element => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    errorDisplay.innerText = '';
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
};

const isValidEmail = email => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
}

const validateInputs = () => {
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();

    if (emailValue === '') {
        setError(email, "Email is required")
    }
    else if (!isValidEmail(emailValue)) {
        setError(email, 'Provide a valid email address');
    }
    else {
        setSuccess(email);
    }

    if (passwordValue === "") {
        setError(password, 'Password is required');
    }
    else if (passwordValue.length < 6) {
        setError(password, 'Password must be at least 6 character')
    } else {
        setSuccess(password);
    }
}

async function handleLoginFormSubmit(event) {
    event.preventDefault();
    validateInputs();

    const form = document.getElementById('form');
    const formData = new FormData(form);

    const email = formData.get('email');
    const password = formData.get('password');

    try {
        localStorage.clear();
        const response = await login({email, password});
        if (response.ok) {
            const data = await response.json();
            const token = data.token;
            localStorage.setItem('token', token);
            window.location.href = '../profile/profile.html'; 
        } 
        else {
            const error = await response.json();
            showError("Неверный логин или пароль" );
        }
    } 
    catch (error) 
    {
        showError('Произошла ошибка при подключении.');
        console.error('Error:', error);
    }
        
}

async function login(data) {
    return await fetch('https://blog.kreosoft.space/api/account/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
}
function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.color = 'red';
}
document.getElementById('register-btn').addEventListener('click', () => {
    window.location.href = '../registration/registration.html';
});
