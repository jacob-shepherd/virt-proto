const accountIcon = document.querySelector('.account-icon')
const dropdown = document.querySelector('.dropdown-1')
const container = document.querySelector('#container-new')
const formClick = document.querySelector('#form')
accountIcon.addEventListener("click", () => {
    if(dropdown.classList.contains('hide')){
    dropdown.classList.remove('hide')
    }else{
        dropdown.classList.add('hide') 
    }
  })

  container.addEventListener("click", () => {
    if(dropdown.classList.contains('hide')){
    }else{
        dropdown.classList.add('hide') 
    }
  })

  formClick.addEventListener("click", () => {
    if(dropdown.classList.contains('hide')){
    }else{
        dropdown.classList.add('hide') 
    }
  })