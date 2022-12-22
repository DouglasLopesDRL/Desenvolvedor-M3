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
let carregarMenos:boolean = false;
let carregarMais:boolean = false;
let carregarParaMediaQuery:boolean = false;
let filtroAtivos:{
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
   inicializarLoja();
   //console.log(listaRoupasFiltrada.length);
  });
}

document.addEventListener("DOMContentLoaded", main);


/*Iniciliar loja:*/
function inicializarLoja(){
  var containerProdutos = document.getElementsByClassName("conteudoprincipal")[0];
  let cont:number;
  // console.log(listaRoupas.length);
  /*Limitando o número de produtos na tela*/
  if(carregarMenos == false && carregarMais == true && carregarParaMediaQuery == false){
     cont = 14;
  } else if(carregarMenos == true && carregarMais == false && carregarParaMediaQuery == false){
     cont = 4;
  } else {
    cont = 9;
  }
  /*Organizando entradas de conteúdo*/
  if(filtroAtivos.length <= 0){
      containerProdutos.innerHTML = '';
      for(let val of listaRoupas){
      console.log(val.name);
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
  } else{
    containerProdutos.innerHTML = '';
      for(let val of listaRoupasFiltrada){
        console.log(val.name);
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
   adicionarEventoClickAosBotoes();
 }
 /*Configuração do Carrinho*/
 let itemCarrinho:Carrinho;
 itemCarrinho = new Carrinho();

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

 
/*Controle dos filtros*/

$('.filtro').click(function(event){
  let check:boolean = false;
  let objFiltro = {id: this.getAttribute('data-id'), tipo: this.getAttribute('data-tipo'), valor: this.getAttribute('data-valor')};
  for(let p in filtroAtivos){
    if(filtroAtivos[p].valor == objFiltro.valor){
      filtroAtivos = filtroAtivos.filter(function(i){return i.valor != objFiltro.valor});
      check = true;
      break;
    }
  } 
  if(check == false){
    filtroAtivos.push(objFiltro);
  }
  filtrarProdutos();
  inicializarLoja();
  if(filtroAtivos.length > 0 && filtroAtivos.length < 6){
    $('.main').toggleClass('diminuirMainProsFiltros');
  } else{
    $('.main').toggleClass('retornarMainPadrao');
  }
});

/*Configurando uma nova listagem de produtos aplicando filtros */
function filtrarProdutos(){
  listaRoupasFiltrada = listaRoupas;
  filtroAtivos.forEach(filtro =>{
    listaRoupasFiltrada = listaRoupasFiltrada.filter(function(roupa){
      let condicaoSatisfeita:boolean = false;
      switch(filtro.tipo){
        case 'size':
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
  carregarMais = true;
  carregarMenos = false;
  carregarParaMediaQuery = false;
  if(filtroAtivos.length <= 0){
    $('.btnCarregarMais').toggleClass('carregarMaisProdutos');
    $('.main').toggleClass('carregarMaisProdutos');
  }
  inicializarLoja();

});
