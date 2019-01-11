(function(apiUrl)
{
  //função que construirá uma div para cada mensagem que foi retornada de '/messages'
  function buildMessage(json)
  {
    var panelOfMessages = document.getElementById("chatPanel");

    var divContent = document.createElement("div");
    var photo = document.createElement("img");
    var parrotImage = document.createElement("img");
    var name = document.createElement("div");
    var date = document.createElement("div");
    var message = document.createElement("div");

    //Definindo a class da DIV que terá todo o conteúdo: mensagem, nome, foto e etc.
    divContent.classList.add("divChat"); 
    divContent.id = json.id;

    //atribuindo valor a imagem do usuario e definindo sua class
    photo.setAttribute("src", json.author.avatar);
    photo.classList.add("profilePhoto");

    /*definindo a class, src e name para imagem do parrot. Além disso, estou adicionando um evento de click, 
    para o parrot ser trocado*/
    parrotImage.src = "images/parrot-grey.png"
    parrotImage.classList.add("parrot");
    parrotImage.name = "false";
    parrotImage.addEventListener("click", function(){
        parrotMessage(document.getElementById(json.id), parrotImage);
    });
      
    //atribuindo valor a DIV nome e definindo sua class
    name.textContent = json.author.id;
    name.classList.add("name");

    //atribuindo valor a DIV data e definindo sua class
    date.textContent = json.created_at.substring(0, 10);
    date.classList.add("date");

    //atribuindo valor a DIV mensagem e definindo sua class
    message.textContent = json.content;
    message.classList.add("message");

    //adicionando o conteudo a div onde aparece a mensagem e o restante
    divContent.appendChild(photo);
    divContent.appendChild(parrotImage);
    divContent.appendChild(name);
    divContent.appendChild(date);
    divContent.appendChild(message);

    //adicionando a div ao painel de mensagens
    panelOfMessages.appendChild(divContent);
  }

  /*Essa pequena função tem o proposito de pegar a mensagem que o usuario escreveu, 
  e qual usuario a escreveu. Com esses dois valores em mão, eles são passados para a função 
  que propriamente enviara a mensagem, que no caso é a function sendMessage().*/
  function getValueMessage()
  {
    document.getElementById("botao_enviar").onclick = function(){
      sendMessage(document.getElementById("caixa_mensagem").value, sessionStorage.getItem("idUsu"));
    }
  }

  function fetchParrotsCount() 
  {
    return fetch(apiUrl + "/messages/parrots-count")
      .then(function(response){
        return response.json();
      })
      .then(function(count){
        document.getElementById("parrots-counter").innerHTML = count;
      });
  }

  function listMessages() 
  {
    // Faz um request para a API de listagem de mensagens
    // Atualiza a o conteúdo da lista de mensagens
    // Deve ser chamado a cada 3 segundos
    const otherParam = {method:"GET"};

    fetch(apiUrl + "/messages", otherParam)
    .then(function(response)
      {return response.json()}
    )
    .then(function(messages)
    { 
      document.getElementById("chatPanel").innerHTML = "";
      for(i = 0; i < messages.length; i++)
      {
        buildMessage(messages[i]);
      }
    })
    .catch(error => console.log("ERROR: " + error))
  }

  function parrotMessage(message, parrotImg) 
  {
    // Faz um request para marcar a mensagem como parrot no servidor
    // Altera a mensagem na lista para que ela apareça como parrot na interface
    var otherParam = {method:"PUT"};
    var url = "";

    if(parrotImg.name == "false")
    {
      parrotImg.name = "true";
      parrotImg.src = "images/parrot.gif";
      message.style = "background:#FFFAE7;";

      url = apiUrl + "/messages/" + message.id + "/parrot";
    }else
    {
      parrotImg.name = "false";
      parrotImg.src = "images/parrot-grey.png";
      message.style = "background:#FFFFFF;";

      url = apiUrl + "/messages/" + message.id + "/unparrot";
    }

    fetch(url, otherParam)
      .then(function(response){ 
        console.log(response);
        fetchParrotsCount();
      })
      .catch(error => console.log("ERROR: " + error));
  }
  
  function sendMessage(message, authorId) 
  {
    // Manda a mensagem para a API quando o usuário envia a mensagem
    // Caso o request falhe exibe uma mensagem para o usuário utilizando Window.alert ou outro componente visual
    // Se o request for bem sucedido, atualiza o conteúdo da lista de mensagens
    
    var otherParam = {
      method: "POST",
      headers: {
        "Accpet":"application/json, text/plain, */*",
        "Content-type":"application/json"
      },
      body: JSON.stringify({
        message: message,
        author_id: authorId
      })
    }

    fetch(apiUrl + "/messages", otherParam)
    .then(response => {return(response.json())})
    .then(resultado => buildMessage(resultado))
    .catch(error => alert("Ocorreu uma falha no envio da mensagem, tente novamente. Error: " + error))
  }

  function getMe() 
  {
    // Faz um request para pegar os dados do usuário atual
    // Exibe a foto do usuário atual na tela e armazena o seu ID para quando ele enviar uma mensagem
    var imagem = document.getElementById("imagem_usuario")
    var otherParam = {method:"GET"};

    fetch(apiUrl + "/me", otherParam)
      .then(response => response.json())
      .then(r => {
        imagem.setAttribute("src",r.avatar);
        sessionStorage.setItem("idUsu", r.id);
      })
      .catch(error => console.log("ERROR: " + error))
  }

  function initialize() 
  {
    fetchParrotsCount();
    getMe();
    listMessages();
    getValueMessage();
    
    setInterval(() =>{
      listMessages();
    }, 3000);
  }

  initialize();
})("https://tagchatter.herokuapp.com");