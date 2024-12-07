

const email = localStorage.getItem('userEmail');
const userEmail = document.getElementById('user-email');
const dropdownMenu = document.getElementById('dropdownMenu');
const dropdownArrow = document.getElementById('dropdownArrow');

document.getElementById("logout").addEventListener("click", async (event) => {
    const response = await fetch('https://blog.kreosoft.space/api/account/logout', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    })
    localStorage.clear();
    window.location.href = '../authorization/authorization.html'; 
})

document.getElementById("profile").addEventListener("click", async (event) => {
    window.location.href = '../profile/profile.html'; 
})


if (userEmail) {
    userEmail.textContent = email || 'Вход';
} else {
    console.error('email not found in localStorage');

}
if (userEmail.textContent === email) {
    userEmail.addEventListener('click', () => {
        dropdownMenu.classList.toggle('visible');
    });
}
else{
    dropdownArrow.style.display = "none";
    userEmail.addEventListener('click', () => {
        window.location.href = '../authorization/authorization.html'; 
    });
}

export async function fetchAuthors() {
    try {
        const response = await fetch('https://blog.kreosoft.space/api/author/list', {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch authors');
        }
        return await response.json();
    }
    catch (error) {
        console.error(error.message);
    }  
}

async function renderAuthors() {
    const authors = await fetchAuthors();
    const authorsContainer = document.querySelector(".container-authors");
    authorsContainer.innerHTML = ""; 

    if (authors && authors.length > 0) {
        const topAuthors = getTopAuthors(authors);
        console.log(topAuthors)
        authors.forEach(async (author) => {
            const authorElement = document.createElement("div");
            authorElement.classList.add("container-authors-card");
            const topIndex = topAuthors.indexOf(author);
            let crownImage = "";
            
            authorElement.innerHTML = `
                <div class="container-authors-card-left">
                    <img class="admin-avatar" src="../images/${author.gender === "Male" ? "man1.png" : "women1.png"}" alt="${author.gender}" class="admin-avatar">
                    <div class="container-authors-card-left-desc">
                        <div class="container-authors-card-left-desc-up">
                            <h3> <spanclass="name">${author.fullName}</span></h3>
                            <b ><i class="create-text">Создан: ${new Date(author.created).toLocaleDateString('ru-RU')}</i></b>
                        </div>
                        <div class="container-authors-card-left-desc-down">
                            ${author.birthDate ? 
                            `<b class="create-text">Дата рождения: </b>
                            <div>${new Date(author.birthDate).toLocaleDateString('ru-RU')}</div>` : ''}
                        </div>
                    </div>
                </div>
                <div class="container-authors-card-right">
                    <div class="container-authors-card-right-inf">Постов: ${author.posts}</div>
                    <div class="container-authors-card-right-inf">Лайков: ${author.likes}</div>
                </div>
            `;

            authorsContainer.appendChild(authorElement); 
            const authorCardLeft = authorElement.querySelector(".container-authors-card-left");

            if (topIndex === 0) {
                crownImage = document.createElement("img");
                crownImage.src = "../images/gold-crown.svg";
                crownImage.alt = "1st place";
                crownImage.classList.add("crown");
                authorCardLeft.appendChild(crownImage); 
            } else if (topIndex === 1) {
                crownImage = document.createElement("img");
                crownImage.src = "../images/grey-crown.svg";
                crownImage.alt = "2nd place";
                crownImage.classList.add("crown");
                authorCardLeft.appendChild(crownImage); 
            } else if (topIndex === 2) {
                crownImage = document.createElement("img");
                crownImage.src = "../images/dark-crown.svg";
                crownImage.alt = "3rd place";
                crownImage.classList.add("crown");
                authorCardLeft.appendChild(crownImage); 
            }
            authorElement.addEventListener("click", () => {
                window.location.href = `../main/main.html?author=${encodeURIComponent(author.fullName)}&page=1&size=5`;
            });
        });
    } else {
        authorsContainer.innerHTML = "<p>Нет авторов для отображения.</p>";
    }
}

function getTopAuthors(authors) {
    const top = [...authors].sort((a, b) => {
        if (b.posts !== a.posts) return b.posts - a.posts;
        return b.likes - a.likes;
    }) ;
    return top.slice(0, 3);
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await renderAuthors();
    } catch (error) {
        console.error("Ошибка при загрузке групп", error.message);
    }
});