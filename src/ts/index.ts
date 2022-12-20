import * as $ from 'jquery';
import { Product } from "./Product";

//Controller
const serverUrl = "http://localhost:5000";
let listaRoupas:Roupa[];
var itemCarrinho:Carrinho;

function main() {
  fetch(serverUrl+'/products').then(function(response) {
    return response.text();
  }).then(function(data){
    const roupa = new Roupa();
    listaRoupas= roupa.parseJson(data);
   // popularProdutos(listaRoupas);
   inicializarLoja(listaRoupas);
  });
}

function filtrarProdutos(){
  
}

document.addEventListener("DOMContentLoaded", main);

//models
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
  private itens:Product[];
  private valorTotal:number;
  private qtdItensCarrinho: number;

  adicionarProduto(produto:Product){
    this.valorTotal += produto.price;
    this.itens.push(produto);
  }

  getTotalItens():number {
    return this.itens.length;
  }

  getQtdItensCarrinho():number{
    return this.qtdItensCarrinho;
  }

  setQtdItensCarrinho():void{
    this.qtdItensCarrinho++;
  }

 public AdicionarProdutoAoCarrinho(){
    //  const quantidadeItemCarrinho = document.getElementById("carrinhoquant");
    //  this.setQtdItensCarrinho();
    //  quantidadeItemCarrinho.innerHTML = `${this.getQtdItensCarrinho()}`;
    // console.log("FOI");
  }

}

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
         <input class="btnComprar" type="button" value="Comprar">
       </div>
     `;
   }
   adicionarEventoClickAosBotoes();
 }
 /*Adicionar itens ao carrinho*/
 function adicionarEventoClickAosBotoes(){
  const btnComprar = document.getElementsByClassName("btnComprar");
  for(let btn of btnComprar){
    btn.addEventListener('click',function(){
     // itemCarrinho.AdicionarProdutoAoCarrinho();

    })
  }
 }
 

/*Controle de menus interativos*/
$('.vermaiscores').click(function(){
  $('.menulateral ul .maiscores').toggleClass('mostra')
  $('.vermaiscores').toggleClass('some')
});

$('.ordenarMenuLateral').click(function(){
  $('.menuOrdenar ul .itensOrdenar').toggleClass('mostra')
});

