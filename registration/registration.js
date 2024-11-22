document.getElementById('register-btn').addEventListener('click', handleRegisterFormSubmit);
const form = document.getElementById('form');
const fullName = document.getElementById('name');
const birthDate = document.getElementById('date');
const gender = document.getElementById('gender');
const phoneNumber = document.getElementById('phone');
const email = document.getElementById('email');
const password = document.getElementById('password');

form.addEventListener('submit', e => {
    e.preventDefault();

    validateInputs();
});

document.addEventListener('DOMContentLoaded', () => {
    const phoneInput = document.getElementById('phone');

    phoneInput.addEventListener('input', formatPhoneNumber);
    phoneInput.addEventListener('blur', validatePhoneNumber);

    function formatPhoneNumber(event) {
        document.getElementById('phone').addEventListener('input', function (e) {
            const input = e.target;
            let value = input.value.replace(/\D/g, '');
            if (value.startsWith('7') || value.startsWith('8')) {
                value = value.slice(1); 
            }
        
            if (value.length > 10) {
                value = value.slice(0, 10);
            }
            input.value = `+7 (${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 8)}-${value.slice(8, 10)}`;
        });}
    function validatePhoneNumber(event) {
        const input = event.target;
        const regex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;

        if (regex.test(input.value)) {
            input.classList.remove('error');
            input.classList.add('success');
        } else {
            input.classList.add('error');
            input.classList.remove('success');
        }
    }
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

const isValidPhone = phone => {
    const re = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    return re.test(String(phone).toLowerCase());
}

const validateInputs = () => {
    let isValid = true;
    const nameValue = fullName.value.trim();
    const dateValue = birthDate.value.trim();
    const genderValue = gender.value.trim();
    const phoneValue = phoneNumber.value.trim();
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();
    console.log(nameValue);
    if (dateValue === "") {
        setError(birthDate, 'Date is required');
        isValid = false;
    }else {
        setSuccess(birthDate);
    }
    if (nameValue === "") {
        setError(fullName, 'Name is required');
        isValid = false;
    }else {
        setSuccess(fullName);
    }
    if (genderValue === "") {
        setError(gender, 'Gender is required');
        isValid = false;
    }else {
        setSuccess(gender);
    }
    if (phoneValue === "") {
        setError(phoneNumber, 'Phone is required');
        isValid = false;
    }else if (!isValidPhone(phoneValue)) {
        setError(phoneNumber, 'Provide a valid phone number');
        isValid = false;
    }else {
        setSuccess(phoneNumber);
    }

    if (emailValue === '') {
        setError(email, "Email is required");
        isValid = false;
    }
    else if (!isValidEmail(emailValue)) {
        setError(email, 'Provide a valid email address');
        isValid = false;
    }
    else {
        setSuccess(email);
    }
    if (passwordValue === "") {
        setError(password, 'Password is required');
        isValid = false;
    }
    else if (passwordValue.length < 6) {
        setError(password, 'Password must be at least 6 character');
        isValid = false;
    } else {
        setSuccess(password);
    }
    return isValid;
}

async function handleRegisterFormSubmit(event) {
    event.preventDefault();
    const isValid = validateInputs();
    if (!isValid) {
        return; 
    }

    const data = {
        fullName: fullName.value.trim(),
        birthDate: birthDate.value.trim(),
        gender: gender.value.trim(),
        phoneNumber: phoneNumber.value.trim(),
        email: email.value.trim(),
        password: password.value.trim()
    };

    console.log("Sending data:", JSON.stringify(data, null, 2));

    try {
        const response = await register(data);
        if (response.ok) {
            
            const responseData = await response.json();
            localStorage.setItem('token', responseData.token);
            window.location.href = '../profile/profile.html';
        } 
        else if (response.status === 400) {
            throw new Error("Пользователь с такой почтой уже существует, повторите попытку")
        }else {
            const error = await response.json();
            throw new Error(error)
        }
    } catch (error) {
        showError(error.message);
        console.error('Error:', error);
    }
}

async function register(data) {
    return await fetch('https://blog.kreosoft.space/api/account/register', {
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
