  const input = document.getElementById('img-input')
  const invalid = document.getElementById('invalid')
  const valid = document.getElementById('valid')
  
  function validateUpload() {
      const upload = document.getElementById('img-ingput')
  
      const fileName = upload.value
  
      //allowed file types
  
      const allowedFileTypes =    /(\.jpg|\.jpeg|\.png)$/i;
  
      if (!allowedFileTypes.exec(fileName)) {
                    invalid.innerText = "invalid file type!"
                    valid.innerText = ""
                    upload.value = '';
              }else{
                    invalid.innerText = ""
                    preview.readAsDataURL(upload.files[0]);
                }
            }
        
  function hidePrompt() {
      invalid.innerText = ""
      valid.innerText = ""
  }

  input.addEventListener('change', e => {
      return validateUpload() 
  })