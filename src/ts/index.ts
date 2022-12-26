import * as $ from 'jquery';
import { event } from 'jquery';
import { Product } from "./Product";


//Modelos
class Roupa implements Product{
  id: string;
  name: string;
  price: number;
  parcelamento: Array<number>;
  color: string;
  image: string;
  size: Array<string>;
  date: string;

  public constructor(){}

  parseJson(json:string):Roupa[]{
      let listaObjetos = JSON.parse(json);
      let listaRoupas:Roupa[] = [];

      for(let obj of listaObjetos){
        let roupa = new Roupa();

        roupa.id = obj.id;
        roupa.name= obj.name;
        roupa.price= obj.price;
        roupa.parcelamento= obj.parcelamento;
        roupa.color= obj.color;
        roupa.image= obj.image;
        roupa.size= obj.size;
        roupa.date= obj.date;

        listaRoupas.push(roupa);
      }

      return listaRoupas;
  }

}
class Carrinho {
  private itens:Product[] = [];
  private valorTotal:number;

 public adicionarProduto(produto:Product){
    this.valorTotal += produto.price;
    this.itens.push(produto);
  }

  public getQtdItensCarrinho():number{
    return this.itens.length;
  }
}

//Controlador
const serverUrl = "http://localhost:5000";
let listaRoupas:Roupa[];
let listaRoupasExibidas:Roupa[];
type filtro = {id:string, tipo:string, valor:string};
let carregarMenos:boolean = false;
let carregarMais:boolean = false;
let carregarParaMediaQuery:boolean = false;
let itemCarrinho:Carrinho;
itemCarrinho = new Carrinho();
let filtrosAtivosCores:string[] = [];
let filtroAtivosPrecos:string[] = [];
let filtroAtivosTamanhos:string[] = [];

function main() {
  fetch(serverUrl+'/products').then(function(response) {
    return response.text();
  }).then(function(data){
    const roupa = new Roupa();
    listaRoupas= roupa.parseJson(data);
    listaRoupasExibidas = listaRoupas;
   inicializarLoja(9);
  });
}

document.addEventListener("DOMContentLoaded", main);

/*Iniciliar loja:*/
function inicializarLoja(cont:number){
  var containerProdutos = document.getElementsByClassName("conteudoprincipal")[0];
  containerProdutos.innerHTML = '';
    for(let val of listaRoupasExibidas){
      let parcelamentoComVirgula = String(val.parcelamento[1]);
      let valorComVirgula = String(val.price);
      parcelamentoComVirgula = parcelamentoComVirgula.replace(".",",");
      valorComVirgula = valorComVirgula.replace(".",",");
      containerProdutos.innerHTML+=
      `<div class="produtosDaPag">
          <img src="${val.image}"/>
          <p class="nomeDosProdutos">${val.name}</p>
          <p class="precoDosProdutos">R$ ${valorComVirgula}</p>
          <p>até ${val.parcelamento[0]}x de R$${parcelamentoComVirgula}</p>
          <input data-id="${val.id}" class="btnComprar" type="button" value="Comprar">
        </div>
      `;
      cont--;
      if(cont<=0){
        break;
      }
    }
    adicionarEventoClickAosBotoes();
 }

/*Controle dos filtros*/

/*CONFIGURAÇÃO FINAL DOS FILTROS*/
function atualizarListaFiltros(objFiltro:filtro, listaFiltros:string[]){
  let indexFiltroAtivo = listaFiltros.indexOf(objFiltro.valor);

  if(indexFiltroAtivo != -1){
    listaFiltros.splice(indexFiltroAtivo, 1)
  }
  else {
    listaFiltros.push(objFiltro.valor);
  }

  return listaFiltros;
}


$('.filtroCor').click(function(event){
  let objFiltro:filtro = {id: this.getAttribute('data-id'), tipo: this.getAttribute('data-tipo'), valor: this.getAttribute('data-valor')};

  filtrosAtivosCores = atualizarListaFiltros(objFiltro, filtrosAtivosCores);
  aplicarFiltros();
});

$('.filtroTamanho').click(function(event){
  let objFiltro:filtro = {id: this.getAttribute('data-id'), tipo: this.getAttribute('data-tipo'), valor: this.getAttribute('data-valor')};
  filtroAtivosTamanhos = atualizarListaFiltros(objFiltro, filtroAtivosTamanhos);
  aplicarFiltros();
});

$('.filtroPreco').click(function(event){
  let objFiltro:filtro = {id: this.getAttribute('data-id'), tipo: this.getAttribute('data-tipo'), valor: this.getAttribute('data-valor')};
  filtroAtivosPrecos = atualizarListaFiltros(objFiltro, filtroAtivosPrecos);
  aplicarFiltros();
});

function aplicarFiltros(){
  listaRoupasExibidas = listaRoupas;

  listaRoupasExibidas = listaRoupasExibidas.filter(function(roupa){
    let satisfazCor = false;
    let satisfazTamanho = false;
    let satisfazPreco = false;

    if(filtrosAtivosCores.length > 0) {
      satisfazCor = filtrosAtivosCores.includes(roupa.color);
    } else {
      satisfazCor = true;
    }
    
    if(filtroAtivosTamanhos.length > 0) {
      for (let size of roupa.size) {
        if(filtroAtivosTamanhos.includes(size)){
          satisfazTamanho = true;
          break;
        }
      }
    } else {
      satisfazTamanho = true;
    }

    if(filtroAtivosPrecos.length > 0) {
      for(let preco of filtroAtivosPrecos){
        let precoMinimo = Number(preco.split('/')[0]);
        let precoMaximo = Number(preco.split('/')[1]);
  
        if(roupa.price >= precoMinimo && roupa.price <= precoMaximo){
          satisfazPreco = true;
          break;
        }
      }
    } else {
      satisfazPreco = true;
    }

    return satisfazCor && satisfazPreco && satisfazTamanho;
  });

  inicializarLoja(9);
}

 /*Configuração do Carrinho*/
function identificarItem(key:string){
  return listaRoupas.find(roupa=> roupa.id == key);
}

function atualizarCarrinho(){
  let carrinhoquant = document.getElementById("carrinhoquant");
  carrinhoquant.innerHTML = `${itemCarrinho.getQtdItensCarrinho()}`;
}

 function adicionarEventoClickAosBotoes(){
  const btnComprar = document.getElementsByClassName("btnComprar");
  for(let btn of btnComprar){
    btn.addEventListener('click',function(event){
    let idProduto = (this.getAttribute('data-id')).toString();
    let produto = identificarItem(idProduto);
    itemCarrinho.adicionarProduto(produto);
    atualizarCarrinho();
    })
  }
 }

/*Configração das Opções de ordenação*/
function ordenarProdutosPorData(){
  listaRoupasExibidas = listaRoupasExibidas.sort(function(roupaA, roupaB){
    let data1 = new Date(roupaA.date);
    let data2 = new Date(roupaB.date)
    return data1 < data2?1:-1;
  });
}
function ordenarProdutosPorMaiorPreco(){
  listaRoupasExibidas = listaRoupasExibidas.sort(function(roupaA, roupaB){
    return roupaA.price < roupaB.price?1:-1;
  });
}
function ordenarProdutosPorMenorPreco(){
  listaRoupasExibidas = listaRoupasExibidas.sort(function(roupaA, roupaB){
    return roupaA.price > roupaB.price?1:-1;
  });
}

/*Configuração dos botões de ordenar do site*/
$('.botaoOrdenarPorData').click(function(){
  ordenarProdutosPorData();
  inicializarLoja(9);
  $('.menumobileordenar').toggleClass('acaoMenuOrd');
});
$('.botaoOrdenarPorMaiorPreco').click(function(){
  ordenarProdutosPorMaiorPreco();
  inicializarLoja(9);
  $('.menumobileordenar').toggleClass('acaoMenuOrd');
});
$('.botaoOrdenarPorMenorPreco').click(function(){
  ordenarProdutosPorMenorPreco();
  inicializarLoja(9);
  $('.menumobileordenar').toggleClass('acaoMenuOrd');
});

/*Controle de menus interativos*/
$('.vermaiscores').click(function(){
  $('.menulateral ul .maiscores').toggleClass('mostra');
  $('.vermaiscores').toggleClass('some');
});

$('.ordenarMenuLateral').click(function(){
  $('.menuOrdenar ul .itensOrdenar').toggleClass('mostra');
});

/*Controle do botão de carregar mais*/
$('.btnCarregarMais').click(function(){
  if(filtroAtivosPrecos.length <= 0 && filtroAtivosTamanhos.length <= 0 && filtrosAtivosCores.length <= 0){
    inicializarLoja(15);
  }
});
/*Configuração do botão de fechar e abrir dos menus mobile*/
/*Menu de filtros*/
$('.botaoFecharMenuFiltrar').click(function(){
  $('.menumobilefilt').toggleClass('acaoMenuFilt');
});
$('.botãoFiltrarMobile').click(function(){
  $('.menumobilefilt').toggleClass('acaoMenuFilt');
});
/*Menu de Ordenar*/
$('.botaoFecharMenuOrdenar').click(function(){
  $('.menumobileordenar').toggleClass('acaoMenuOrd');
});
$('.botaoOrdenarMobile').click(function(){
  $('.menumobileordenar').toggleClass('acaoMenuOrd');
});
/*COnfiguração dos botões de aplicar e Limpar do menu de filtros */
$('.botoesMenuFiltrarAplicar').click(function(){
  $('.menumobilefilt').toggleClass('acaoMenuFilt');
});

$('.botoesMenuFiltrarLimpar').click(function(){
  filtroAtivosPrecos = [];
  filtroAtivosTamanhos = [];
  filtrosAtivosCores = [];
  inicializarLoja(9);
});
/*Confiuração de marcação de borda nos botões de Tamanho*/
$('.filtroTamP').click(function(){
  $('.filtroTamP').toggleClass('bordaMarcada');
});
$('.filtroTamM').click(function(){
  $('.filtroTamM').toggleClass('bordaMarcada');
});
$('.filtroTamG').click(function(){
  $('.filtroTamG').toggleClass('bordaMarcada');
});
$('.filtroTamGG').click(function(){
  $('.filtroTamGG').toggleClass('bordaMarcada');
});
$('.filtroTamU').click(function(){
  $('.filtroTamU').toggleClass('bordaMarcada');
});
$('.filtroTam36').click(function(){
  $('.filtroTam36').toggleClass('bordaMarcada');
});
$('.filtroTam38').click(function(){
  $('.filtroTam38').toggleClass('bordaMarcada');
});
$('.filtroTam40').click(function(){
  $('.filtroTam40').toggleClass('bordaMarcada');
});
$('.filtroTam42').click(function(){
  $('.filtroTam42').toggleClass('bordaMarcada');
});
$('.filtroTam44').click(function(){
  $('.filtroTam44').toggleClass('bordaMarcada');
});
$('.filtroTam46').click(function(){
  $('.filtroTam46').toggleClass('bordaMarcada');
});