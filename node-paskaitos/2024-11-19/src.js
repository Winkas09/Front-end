document.getElementById('animalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = document.getElementById('type').value;
    const age = document.getElementById('age').value;
    const name = document.getElementById('name').value;
    const breed = document.getElementById('breed').value;
    const color = document.getElementById('color').value;

    try {
        const response = await fetch('http://localhost:3000/api/animals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type, age, name, breed, color })
        });

        if (response.ok) {
            alert('Animal added successfully');
            document.getElementById('animalForm').reset();
        } else {
            const errorData = await response.text();
            alert(`Failed to add animal: ${errorData}`);
        }
    } catch (error) {
        alert(`Failed to add animal: ${error.message}`);
    }
});

document.getElementById('fetchAllAnimals').addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:3000/api/animals');
        const animals = await response.json();
        const allAnimalList = document.getElementById('allAnimalList');
        allAnimalList.innerHTML = '';
        animals.forEach(animal => {
            const li = document.createElement('li');
            li.textContent = `${animal.type}, ${animal.age} years old, ${animal.name}, ${animal.breed}, ${animal.color}`;
            allAnimalList.appendChild(li);
        });
    } catch (error) {
        alert(`Failed to fetch animals: ${error.message}`);
    }
});

document.getElementById('fetchSortedAnimals').addEventListener('click', async () => {
    const searchPhrase = document.getElementById('searchPhrase').value;
    const sortBy = document.getElementById('sortBy').value;

    try {
        const response = await fetch(`http://localhost:3000/api/animals/${searchPhrase}/${sortBy}`);
        const animals = await response.json();
        const sortedAnimalList = document.getElementById('sortedAnimalList');
        sortedAnimalList.innerHTML = '';
        animals.forEach(animal => {
            const li = document.createElement('li');
            li.textContent = `${animal.type}, ${animal.age} years old, ${animal.name}, ${animal.breed}, ${animal.color}`;
            sortedAnimalList.appendChild(li);
        });
    } catch (error) {
        alert(`Failed to fetch animals: ${error.message}`);
    }
});