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
let listaRoupasFiltrada:Roupa[];
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
    carregarConteudoDaPag(cont, listaRoupas);
    // $('.btnCarregarMais').toggleClass('botaoMaisProdutosSome');
  } else if(ref == 1){
    carregarConteudoDaPag(cont, listaRoupasFiltrada);
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

$('.filtroTamanho').click(function(event){ //@IMPORTANTE: Pq aqui o seletor nao e por classe como nos outros filtros?
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
  listaRoupasFiltrada = listaRoupas;

  listaRoupasFiltrada = listaRoupasFiltrada.filter(function(roupa){
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

  inicializarLoja(9,1);
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
  if(filtroAtivosPrecos.length <= 0 && filtroAtivosTamanhos.length <= 0 && filtrosAtivosCores.length <= 0){
    $('.btnCarregarMais').toggleClass('botaoMaisProdutosSome');
    inicializarLoja(15,0);
  }
});
/*Configuração do botão de fechar e abrir dos menus mobile*/
/*Menu de filtros*/
$('.botaoFecharMenuFiltrar').click(function(){
  $('.menumobilefilt').toggleClass('acaoMenu');
});
$('.botãoFiltrarMobile').click(function(){
  $('.menumobilefilt').toggleClass('acaoMenu');
});

/*COnfiguração dos botões de aplicar e Limpar do menu de filtros */
$('.botoesMenuFiltrarAplicar').click(function(){
  $('.menumobilefilt').toggleClass('acaoMenu');
});

$('.botoesMenuFiltrarLimpar').click(function(){
  filtroAtivosPrecos = [];
  filtroAtivosTamanhos = [];
  filtrosAtivosCores = [];
  inicializarLoja(9,0);
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