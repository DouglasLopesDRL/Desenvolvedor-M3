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

function main() {
  fetch(serverUrl+'/products').then(function(response) {
    return response.text();
  }).then(function(data){
    const roupa = new Roupa();
    listaRoupas= roupa.parseJson(data);
   inicializarLoja(listaRoupas);
  });
}

function filtrarProdutos(){
  
}

document.addEventListener("DOMContentLoaded", main);


/*Iniciliar loja:*/
function inicializarLoja(listRoupas:Roupa[]){
  var containerProdutos = document.getElementsByClassName("conteudoprincipal")[0];
   for(let val of listRoupas){
     console.log(val.name);
     let parcelamentoComVirgula = String(val.parcelamento[1]);
     containerProdutos.innerHTML+=
     `<div class="produto">
         <img src="${val.image}"/>
         <p>${val.name}</p>
         <p>R$ ${val.price},00</p>
         <p>até ${val.parcelamento[0]}x de R$${parcelamentoComVirgula.replace(".",",")}</p>
         <input data-id="${val.id}" class="btnComprar" type="button" value="Comprar">
       </div>
     `;
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
function teste(){
  alert("foi");
}


/*Controle de menus interativos*/
$('.vermaiscores').click(function(){
  $('.menulateral ul .maiscores').toggleClass('mostra')
  $('.vermaiscores').toggleClass('some')
});

$('.ordenarMenuLateral').click(function(){
  $('.menuOrdenar ul .itensOrdenar').toggleClass('mostra')
});

