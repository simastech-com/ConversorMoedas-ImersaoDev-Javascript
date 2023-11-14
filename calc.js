//carrega dados de uma página externa
async function carregarPaginaExterna(url) {
    var prom = new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                resolve(xhr.responseText);
            }
        };

        xhr.open("GET", url, true);
        xhr.send();
    });

    return await prom;
}

//converte os valores
document.getElementById("form").addEventListener('submit', (e) => {
    converterValores();
    e.preventDefault();
});

async function converterValores() {
    var retorno = "";

    var moedaSelecionada = document.getElementById("moeda");
    var nome = document.getElementById("nome").value;
    var valor = document.getElementById("valor").value;

    if (nome == "") {
        retorno = "Informe seu nome";
    }
    else if (valor == "") {
        retorno = "Informe um valor";
    }
    else if (isNaN(Number(valor))) {
        retorno = "Informe um número";
    }
    else {
        var chave = moedaSelecionada.value;
        var auxChave = chave.split("-");
        var cotacao = await obterCotacao(chave);
        var cotacaoUSD = await obterCotacao(auxChave[0] + "-USD");
        var cotacaoUSDBTC = await obterCotacao("BTC-USD");


        if (cotacao != null && cotacaoUSD != null && cotacaoUSDBTC != null) {
            retorno = "Olá " + nome + '<br/>'
            retorno += Number(valor).toFixed(2) + " " + auxChave[0] + " = " + (valor * cotacao).toFixed(2) + " " + auxChave[1] + "<br/>";
            retorno += Number(valor).toFixed(2) + " " + auxChave[0] + " = " + (valor * cotacaoUSD / cotacaoUSDBTC).toFixed(7) + " BTC<br/>";
        }
        else {
            retorno = "Não foi possível carregar os dados da moeda!";
        }
    }

    document.getElementById("resultado").innerHTML = retorno;
}

async function obterCotacao(moeda) {
    var auxChave = moeda.split("-");

    var respostaTexto = await carregarPaginaExterna("https://economia.awesomeapi.com.br/last/" + moeda);
    var conversao = null;
    if (respostaTexto != null) {
        conversao = JSON.parse(respostaTexto);
        conversao = conversao[auxChave[0] + auxChave[1]].ask;
    }

    return conversao;
}

//carrega as moedas
async function carregarMoedas() {
    var respostaTexto = await carregarPaginaExterna("https://economia.awesomeapi.com.br/xml/available");

    if (respostaTexto != null) {
        //Limpamdo texto
        var aux = respostaTexto.search('<xml>');
        respostaTexto = respostaTexto.substring(aux + 5, respostaTexto.length);

        aux = respostaTexto.search('</xml>');
        respostaTexto = respostaTexto.substring(0, aux);

        // Carregando moedas
        var tags = respostaTexto.split(">");
        var moedas = [];
        for (var i = 0; i < tags.length - 2; i += 2) {
            var indice = tags[i].substring(1, tags[i].length);
            var auxNome = tags[i + 1].split("<");
            var nome = auxNome[0];
            moedas[indice] = nome;
        }

        var objMoedas = Object.entries(moedas);

        objMoedas.sort(function (a, b) {
            var keyA = a[0];
            var keyB = b[0];

            return keyA.localeCompare(keyB);
        });

        //Preenchendo valores
        var opcoes = "";
        for (var i = 0; i < objMoedas.length; i++) {
            var indice = objMoedas[i][0];
            var nome = objMoedas[i][1];
            var auxNomeSplit = nome.split("/");
            var auxIndice = indice.split("-");
            var selecionado = (indice == "BRL-USD") ? "selected" : "";
            opcoes += '<option value="' + indice + '"' + selecionado + '>[' + auxIndice[0] + '] ' + auxNomeSplit[0] + ' => ' + auxNomeSplit[1] + ' [' + auxIndice[1] + ']</option>';
        }
        document.getElementById("moeda").innerHTML = opcoes;
    }
}