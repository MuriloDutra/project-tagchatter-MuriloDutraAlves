(function(apiUrl)
{
  //função que construirá uma div para cada mensagem que foi retornada de '/messages'
  function buildMessage(json){
    var panelOfMessages = $("#chatPanel");

    var divContent = $("<div>");
    var photo = $("<img>");
    var parrotImage = $("<img>");
    var name = $("<div>");
    var date = $("<div>");
    var message = $("<div>");

    //Definindo a class da DIV que terá todo o conteúdo: mensagem, nome, foto e etc.
    divContent.addClass("divChat"); 
    divContent.attr("id", json.id);

    //atribuindo valor a imagem do usuario e definindo sua class
    photo.attr("src", json.author.avatar);
    photo.addClass("profilePhoto");

    /*definindo a class, src e name para imagem do parrot. Além disso, estou adicionando um evento de click, 
    para o parrot ser trocado*/
    parrotImage.attr("src", "images/parrot-grey.png");
    parrotImage.addClass("parrot");
    parrotImage.attr("name", false);
    parrotImage.click(function(){
        parrotMessage($(this).parent(), parrotImage);
    });
      
    //atribuindo valor a DIV nome e definindo sua class
    name.text(json.author.id);
    name.addClass("name");

    //atribuindo valor a DIV data e definindo sua class
    date.text(json.created_at.substring(0, 10));
    date.addClass("date");

    //atribuindo valor a DIV mensagem e definindo sua class
    message.text(json.content);
    message.addClass("message");

    //adicionando o conteudo a div onde aparece a mensagem e o restante
    divContent.append(photo);
    divContent.append(parrotImage);
    divContent.append(name);
    divContent.append(date);
    divContent.append(message);

    //adicionando a div ao painel de mensagens
    panelOfMessages.append(divContent);
  }

  /*Essa pequena função tem o proposito de pegar a mensagem que o usuario escreveu, 
  e qual usuario a escreveu. Com esses dois valores em mão, eles são passados para a função 
  que propriamente enviara a mensagem, que no caso é a function sendMessage().*/
  function getValueMessage(){
    $("#submit_button").click(function(){
      sendMessage($("#box_message").val(), sessionStorage.getItem("idUsu"));
      $("#box_message").val('');
    });
  }

  function fetchParrotsCount(){
    return fetch(apiUrl + "/messages/parrots-count")
      .then(function(response){
        return response.json();
      })
      .then(function(count){
        $("#parrots-counter").text(count);
      });
  }

  function listMessages(){
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
      $("#chatPanel").html('');
      for(i = 0; i < messages.length; i++)
      {
        buildMessage(messages[i]);
      }
    })
    .catch(error => console.log("ERROR: " + error))
  }

  function parrotMessage(message, parrotImg){
    console.log(message);
    // Faz um request para marcar a mensagem como parrot no servidor
    // Altera a mensagem na lista para que ela apareça como parrot na interface
    var otherParam = {method:"PUT"};
    var url = "";

    if(parrotImg.attr("name") == "false"){
      parrotImg.attr("name", true);
      parrotImg.attr("src", "images/parrot.gif");
      message.css("background-color", "#FFFAE7");

      url = apiUrl + "/messages/" + message.id + "/parrot";
    }else{
      parrotImg.attr("name", "false");
      parrotImg.attr("src", "images/parrot-grey.png");
      message.css("background-color", "#FFFFFF");

      url = apiUrl + "/messages/" + message.id + "/unparrot";
    }

    fetch(url, otherParam)
      .then(function(response){ 
        fetchParrotsCount();
      })
      .catch(error => console.log("ERROR: " + error));
  }
  
  function sendMessage(message, authorId){
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

  function getMe(){
    // Faz um request para pegar os dados do usuário atual
    // Exibe a foto do usuário atual na tela e armazena o seu ID para quando ele enviar uma mensagem
    var image = $("#user_image");
    var otherParam = {method:"GET"};

    fetch(apiUrl + "/me", otherParam)
      .then(response => response.json())
      .then(r => {
        image.attr("src",r.avatar);
        sessionStorage.setItem("idUsu", r.id);
      })
      .catch(error => console.log("ERROR: " + error))
  }

  function initialize(){
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