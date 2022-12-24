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
      // return <Roupa[]> JSON.parse(json);
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
let listaRoupasFiltrada:Roupa[];
type filtro = {id:string, tipo:string, valor:string};
let carregarMenos:boolean = false;
let carregarMais:boolean = false;
let carregarParaMediaQuery:boolean = false;
let itemCarrinho:Carrinho;
itemCarrinho = new Carrinho();
let filtroAtivos:{
  id:string,
  tipo:string,
  valor:string
}[] = [];
let filtroAtivosCores:{
  id:string,
  tipo:string,
  valor:string
}[] = [];
let filtroAtivosTamanhos:{
  id:string,
  tipo:string,
  valor:string
}[] = [];
let filtroAtivosPrecos:{
  id:string,
  tipo:string,
  valor:string
}[] = [];

function main() {
  fetch(serverUrl+'/products').then(function(response) {
    return response.text();
  }).then(function(data){
    const roupa = new Roupa();
    listaRoupas= roupa.parseJson(data);
   inicializarLoja(9,0);
  });
}

document.addEventListener("DOMContentLoaded", main);

function carregarConteudoDaPag(cont:number, listaFinalProduto:Roupa[]){
  var containerProdutos = document.getElementsByClassName("conteudoprincipal")[0];
  containerProdutos.innerHTML = '';
    for(let val of listaFinalProduto){
      let parcelamentoComVirgula = String(val.parcelamento);
      containerProdutos.innerHTML+=
      `<div class="produtosDaPag">
          <img src="${val.image}"/>
          <p>R$ ${val.price},00</p>
          <p>${val.color}</p>
          <p>${val.size}</p>
          <p>até ${val.parcelamento[0]}x de R$${parcelamentoComVirgula.replace(".",",")}</p>
          <input data-id="${val.id}" class="btnComprar" type="button" value="Comprar">
        </div>
      `;
      cont--;
      if(cont<=0){
        break;
      }
    }
  
}

/*Iniciliar loja:*/
function inicializarLoja(cont:number,ref:number){

  /*Organizando entradas de conteúdo*/
  if(ref == 0){
    console.log("LISTA PADRAO:",ref);
    carregarConteudoDaPag(cont, listaRoupas);
  } else if(ref == 1){
    console.log("LISTA FILTRADA:",ref);
    carregarConteudoDaPag(cont, listaRoupasFiltrada);
  } 
   adicionarEventoClickAosBotoes();
 }

/*Controle dos filtros*/
$('.filtro').click(function(event){
  let objFiltro = {id: this.getAttribute('data-id'), tipo: this.getAttribute('data-tipo'), valor: this.getAttribute('data-valor')};
    let indexFiltroAtivo = filtroAtivos.findIndex(filtro => filtro.id == objFiltro.id);

    if(indexFiltroAtivo != -1){
        filtroAtivos.splice(indexFiltroAtivo, 1)
    }
    else {
        filtroAtivos.push(objFiltro);
    }
    filtrarProdutos();
  if(filtroAtivos.length <= 0){
    inicializarLoja(9,0);
  }else {
    
    inicializarLoja(7,1);}
});

/*Configurando uma nova listagem de produtos aplicando filtros */
function filtrarProdutosRoupas(){
  

}
function separarFiltrosNosArrays(objFiltro:filtro, filtrosAny:filtro[]){
  let indexFiltroAtivo = filtrosAny.findIndex(filtro => filtro.id == objFiltro.id);

  if(indexFiltroAtivo != -1){
    filtrosAny.splice(indexFiltroAtivo, 1)
  }
  else {
    filtrosAny.push(objFiltro);
  }

  return filtrosAny;
}

$('.filtroCor').click(function(event){
  let objFiltro:filtro = {id: this.getAttribute('data-id'), tipo: this.getAttribute('data-tipo'), valor: this.getAttribute('data-valor')};
  filtroAtivosCores = separarFiltrosNosArrays(objFiltro, filtroAtivosCores);
  aplicarFiltros();
  inicializarLoja(9,1);
});

$('.filtroTamanho').click(function(event){
  let objFiltro:filtro = {id: this.getAttribute('data-id'), tipo: this.getAttribute('data-tipo'), valor: this.getAttribute('data-valor')};
  filtroAtivosTamanhos = separarFiltrosNosArrays(objFiltro, filtroAtivosTamanhos);
  aplicarFiltros(); 
});

$('.filtroPreco').click(function(event){
  let objFiltro:filtro = {id: this.getAttribute('data-id'), tipo: this.getAttribute('data-tipo'), valor: this.getAttribute('data-valor')};
  filtroAtivosPrecos = separarFiltrosNosArrays(objFiltro, filtroAtivosPrecos); 
  aplicarFiltros(); 
});

function aplicarFiltros(){
  // filtroAtivosCores.forEach(filt =>{
  //   listaRoupasFiltrada = listaRoupas.filter(function(roupa){return filt.valor == roupa.color});
  // });
    
  // filtroAtivosTamanhos.forEach(filt =>{
  //   listaRoupasFiltrada = listaRoupasFiltrada.filter(function(roupa){return filt.valor == roupa.size})
  // });
}

function filtrarProdutos(){
  listaRoupasFiltrada = listaRoupas;
  filtroAtivos.forEach(filtro =>{
    listaRoupasFiltrada = listaRoupas.filter(function(roupa){
      let condicaoSatisfeita:boolean = false;
      switch(filtro.tipo){
        case 'size':
          console.log("ROUPA",roupa[filtro.tipo], "FILTRO", filtro.valor);
          condicaoSatisfeita = (roupa[filtro.tipo].includes(filtro.valor));
          break;
        case 'color':
          condicaoSatisfeita = (roupa[filtro.tipo] == filtro.valor);
          break;
        case 'price':
          let limiteInferior = filtro.valor.split('/')[0];
          let limiteSuperior = filtro.valor.split('/')[1];
          condicaoSatisfeita = (Number(roupa[filtro.tipo]) >= Number(limiteInferior) && Number(roupa[filtro.tipo]) <= Number(limiteSuperior));
          break;
        default:
          break;  
      }
      return condicaoSatisfeita;
    });
  });
  return listaRoupasFiltrada;
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
  if(filtroAtivos.length <= 0){
    $('.btnCarregarMais').toggleClass('carregarMaisProdutos');
    $('.main').toggleClass('carregarMaisProdutos');
    inicializarLoja(14,0);
  }

});
