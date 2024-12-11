const token = localStorage.getItem('token');
const form = document.getElementById('form');
const userEmail = document.getElementById('user-email');
const dropdownMenu = document.getElementById('dropdownMenu');
const logoutButton = document.getElementById('logout');
const profileButton = document.getElementById('profile');

document.getElementById("logout").addEventListener("click", async (event) => {
    const response = await fetch('https://blog.kreosoft.space/api/account/logout', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    })
    localStorage.clear();
    window.location.href = '../authorization/authorization.html'; 
    console.log(response)
}
)

document.getElementById("profile").addEventListener("click", async (event) => {
    window.location.href = './profile.html'; 
})


if (token) {
    fetch('https://blog.kreosoft.space/api/account/profile', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const fullName = document.getElementById('name');
        const gender = document.getElementById('gender');
        const birthDate = document.getElementById('date');
        const phoneNumber = document.getElementById('phone');
        const email = document.getElementById('email');
    
        if (fullName) fullName.value = data.fullName || '';
        if (birthDate) birthDate.value = formatDateToInput(data.birthDate) || '';
        if (gender) gender.value = data.gender || '';
        if (email) email.value = data.email || '';
        if (phoneNumber) phoneNumber.value = formatPhoneNumber(data.phoneNumber || '');
        console.log(birthDate.value)

        userEmail.textContent = data.email;
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('userId', data.id);
    });
} else {
    showError('Сначала авторизуйтесь')
    window.location.href = '../authorization/authorization.html'; 
    console.error('Auth token not found in localStorage');
}
userEmail.addEventListener('click', () => {
    dropdownMenu.classList.toggle('visible');
});

function formatPhoneNumber(value) {
    let cleanValue = value.replace(/\D/g, '');

    if (cleanValue.startsWith('7') || cleanValue.startsWith('8')) {
        cleanValue = cleanValue.slice(1);
    }
    cleanValue = cleanValue.slice(0, 10);
    let formattedNumber = '+7';
    if (cleanValue.length > 0) {
        formattedNumber += ` (${cleanValue.slice(0, 3)}`;
    }
    if (cleanValue.length >= 4) {
        formattedNumber += `) ${cleanValue.slice(3, 6)}`;
    }
    if (cleanValue.length >= 7) {
        formattedNumber += `-${cleanValue.slice(6, 8)}`;
    }
    if (cleanValue.length >= 9) {
        formattedNumber += `-${cleanValue.slice(8, 10)}`;
    }
    return formattedNumber;
}

function formatDateToInput(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

document.getElementById('save-btn').addEventListener('click', handleUpdateProfile);

async function handleUpdateProfile(event) {
    event.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Auth token not found in localStorage');
        return;
    }

    if (!form.checkValidity())  form?.reportValidity();


    const fullName = document.getElementById('name').value;
    const gender = document.getElementById('gender').value;
    const birthDate = document.getElementById('date').value;
    const phoneNumber = document.getElementById('phone').value;
    const email = document.getElementById('email').value;

    const profileData = {
        fullName: fullName,
        gender: gender,
        birthDate: birthDate,
        phoneNumber: phoneNumber,
        email: email
    };

    try {
        const response = await fetch('https://blog.kreosoft.space/api/account/profile', {
            method: 'PUT',
            headers: {
            'Authorization': `Bearer ${token}`,
            'Content-type' : 'application/json'
        },
        body: JSON.stringify(profileData)
        })
        if (!response.ok) {
            const error = await response.json();
            if(response.status == 400) {
                throw new Error('Введённые данные некорректны');
            }
            if(response.status == 401) {
                throw new Error('Пользователь не авторизован');
            }   
        } 
        else {
            userEmail.textContent = profileData.email;
            localStorage.setItem('userEmail', profileData.email);
            showSuccess("Профиль успешно обновлен!" );
        }
    } 
    catch (error) 
    {
        showError(error.message);
        console.error('Error:', error);
    }
}

function showError(message) {
    const successElement = document.querySelector('.message-success');
    if (successElement) successElement.textContent = '';
    const errorElement = document.querySelector('.message-error');
    if (errorElement) errorElement.textContent = message;
}
function showSuccess(message) {
    const errorElement = document.querySelector('.message-error');
    if (errorElement) errorElement.textContent = '';
    const successElement = document.querySelector('.message-success');
    if (successElement) successElement.textContent = message;
}
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
});