import '../profile/dropdownMenu.mjs';
import '../profile/getProfile.js';

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

            const leftDiv = document.createElement("div");
            leftDiv.classList.add("container-authors-card-left");

            const avatarImg = document.createElement("img");
            avatarImg.classList.add("admin-avatar");
            avatarImg.src = (author.gender === "Male" ? "../images/man1.png" : "../images/women1.png");
            avatarImg.alt = author.gender;

            const leftDesc = document.createElement("div");
            leftDesc.classList.add("container-authors-card-left-desc");

            const leftDescUp = document.createElement("div");
            leftDescUp.classList.add("container-authors-card-left-desc-up");

            const name = document.createElement("h3");
            name.classList.add("name");
            name.textContent = author.fullName;

            const b = document.createElement("b");
            const createText = document.createElement("i");
            createText.classList.add("create-text");
            createText.textContent = `Создан: ${new Date(author.created).toLocaleDateString('ru-RU')}`;

            b.appendChild(createText);

            leftDescUp.appendChild(name);
            leftDescUp.appendChild(b);

            const leftDescDown = document.createElement("div");
            leftDescDown.classList.add("container-authors-card-left-desc-down");

            if (author.birthDate) {
                const birth = document.createElement("b");
                birth.classList.add("create-text");
                birth.textContent = "Дата рождения: ";
                const date = document.createElement("div");
                date.textContent = new Date(author.birthDate).toLocaleDateString('ru-RU');
                leftDescDown.appendChild(birth);
                leftDescDown.appendChild(date);
            }

            leftDesc.appendChild(leftDescUp);
            leftDesc.appendChild(leftDescDown);

            leftDiv.appendChild(avatarImg);
            leftDiv.appendChild(leftDesc);

            const rightDiv = document.createElement("div");
            rightDiv.classList.add("container-authors-card-right");

            const posts = document.createElement("div");
            posts.classList.add("container-authors-card-right-inf");
            posts.textContent = `Постов: ${author.posts}`;
            const likes = document.createElement("div");
            likes.classList.add("container-authors-card-right-inf");
            likes.textContent = `Лайков: ${author.likes}`;

            rightDiv.appendChild(posts);
            rightDiv.appendChild(likes);
            
            authorElement.appendChild(leftDiv);
            authorElement.appendChild(rightDiv);

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
        const noPostsMessage = document.createElement("p");
        noPostsMessage.textContent = "Нет постов для отображения.";
        authorsContainer.appendChild(noPostsMessage);
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