
const storage = 'campus_taks';
const setting = 'campus_seting';

let settings = null;








function addedData() {
    try{
        const addedTasks = localStorage.getItem(storage);
        if (addedTasks) {
            tasks = JSON.parse(addedTasks);
        }

        const addedSettings = localStorage.getItem(setting);
        if (addedSettings) {
            settings = JSON.parse(addedSettings);
        }
        console.log('Tasks loaded', 'tasks');
        
    } catch (error) {
        console.error(error);
        alert('error load data');
       
    }


}

function saveData() {
    try{
        localStorage.setItem(storage, JSON.stringify(tasks));
        localStorage.setItem(setting, JSON.stringify(settings));
        console.log('Data saved!');
    } catch (error) {
        console.error(error);
        alert('Error saving data!');
    }
}





const form = document.getElementById('form-list');

if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const title = document.getElementById('task-title').value;
        const dueDate = document.getElementById('task-date').value;
        const duration = document.getElementById('duration').value;
        const description = document.getElementById('description').value;
        const tag = document.getElementById('tags').value;




    })
}