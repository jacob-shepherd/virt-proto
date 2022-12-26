var track_form_1 = document.querySelector('.track_1_form')
var track_form_2 = document.querySelector('.track_2_form')
var track_form_3 = document.querySelector('.track_3_form')
var track_form_4 = document.querySelector('.track_4_form')
var track_form_5 = document.querySelector('.track_5_form')



const track_name_1 = document.querySelector('.track_name_1')
const track_name_2 = document.querySelector('.track_name_2')
const track_name_3 = document.querySelector('.track_name_3')
const track_name_4 = document.querySelector('.track_name_4')
const track_name_5 = document.querySelector('.track_name_5')


const track_file_1 = document.querySelector('.track_file_1')
const track_file_2 = document.querySelector('.track_file_2')
const track_file_3 = document.querySelector('.track_file_3')
const track_file_4 = document.querySelector('.track_file_4')
const track_file_5 = document.querySelector('.track_file_5')




const invalid_name_1 = document.querySelector('.valid-name-1')
const invalid_name_2 = document.querySelector('.invalid-name-2')
const invalid_name_3 = document.querySelector('.invalid-name-3')
const invalid_name_4 = document.querySelector('.invalid-name-4')
const invalid_name_5 = document.querySelector('.invalid-name-5')


const valid_name_1 = document.querySelector('.valid-name-1')
const valid_name_2 = document.querySelector('.valid-name-2')
const valid_name_3 = document.querySelector('.valid-name-3')
const valid_name_4 = document.querySelector('.valid-name-4')
const valid_name_5 = document.querySelector('.valid-name-5')






const invalid_file_2 = document.querySelector('.track_2_inv')
const invalid_file_3 = document.querySelector('.track_3_inv')
const invalid_file_4 = document.querySelector('.track_4_inv')
const invalid_file_5 = document.querySelector('.track_5_inv')

const valid_file_2 = document.querySelector('.track_2_val')
const valid_file_3 = document.querySelector('.track_3_val')
const valid_file_4 = document.querySelector('.track_4_val')
const valid_file_5 = document.querySelector('.track_5_val')




const allowedCharsName = /^[a-zA-Z0-9_? ]{1,35}$/



const track_file = document.querySelector('.track_file')
const form = document.getElementById('form')
const submit = document.getElementById('submit')



submit.addEventListener('click', e => {
e.preventDefault()


const track_titles = [ track_name_1.value]
if(track_form_2.classList.contains('visible')){
    track_titles.push(track_name_2.value)
}
if(track_form_3.classList.contains('visible')){
    track_titles.push(track_name_3.value)
}
if(track_form_4.classList.contains('visible')){
    track_titles.push(track_name_4.value)
}
if(track_form_5.classList.contains('visible')){
    track_titles.push(track_name_5.value)
}
console.log(track_titles)
let i = 0;
let j = 1
while (i < track_titles.length) {
    console.log(track_titles[i]);
    const validName = allowedCharsName.test(track_titles[i])
    const valid_name = 'valid_name_' + j 
    const invalid_name = 'invalid_name_' + j 
        console.log(valid_name)
    if(validName){
        valid_name_[j].innerText = 'good'
    }if(!validName){
        invalid_name_[j].innerText = "can't contain special characters or be longer than 35 characters"
        e.preventDefault()
        e.stopPropagation()
    }
    i++;
    j++;
}

})