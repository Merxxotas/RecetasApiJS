function iniciarApp() {
  const selectCategorias = document.querySelector("#categorias");
  selectCategorias.addEventListener("change", seleccionarCategoria);

  const resultado = document.querySelector("#resultado");
  const modal = new bootstrap.Modal("#modal", {});
  obtenerCategorias();
  function obtenerCategorias() {
    const url = "https://www.themealdb.com/api/json/v1/1/categories.php";
    fetch(url)
      .then((respuesta) => respuesta.json())
      .then((resultado) => mostrarCategorias(resultado.categories));
  }

  function mostrarCategorias(categorias = []) {
    categorias.forEach((categoria) => {
      //aplicando Destructuring a categoria
      const { strCategory } = categoria;
      const option = document.createElement("OPTION");
      option.Value = strCategory;
      option.textContent = strCategory;
      selectCategorias.appendChild(option);
    });
  }

  function seleccionarCategoria(e) {
    const categoria = e.target.value;
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;
    // console.log(url);
    fetch(url)
      .then((respuesta) => respuesta.json())
      .then((resultado) => mostrarRecetas(resultado.meals));
  }

  function mostrarRecetas(recetas = []) {
    limpiarHtml(resultado);

    const heading = document.createElement("H2");
    heading.classList.add("text-center", "text-black", "my-5");
    heading.textContent = recetas.length
      ? "Resultados a continuación"
      : "No hay resultados de esta receta";
    resultado.appendChild(heading);
    recetas.forEach((receta) => {
      const { idMeal, strMeal, strMealThumb } = receta;
      const recetaContenedor = document.createElement("DIV");
      recetaContenedor.classList.add("col-md-4");
      const recetaCard = document.createElement("DIV");
      recetaCard.classList.add("card", "mb-4");
      const recetaImagen = document.createElement("IMG");
      recetaImagen.classList.add("card-img-top");
      recetaImagen.alt = `Imagen de la receta ${strMeal ?? receta.titulo}`;
      recetaImagen.src = strMealThumb ?? receta.img;
      const recetaCardBody = document.createElement("DIV");
      recetaCardBody.classList.add("card-body");
      const recetaHeading = document.createElement("H3");
      recetaHeading.classList.add("card-title", "mb-3");
      recetaHeading.textContent = strMeal ?? receta.titulo;
      const recetaButton = document.createElement("BUTTON");
      recetaButton.classList.add("btn", "btn-danger", "w-100");
      recetaButton.textContent = "Ver Receta";
      // recetaButton.dataset.bsTarget = '#modal';
      // recetaButton.dataset.bsToggle = 'modal';
      recetaButton.onclick = function () {
        seleccionarReceta(idMeal ?? receta.id);
      };

      //Inyectar en el código HTML
      recetaCardBody.appendChild(recetaHeading);
      recetaCardBody.appendChild(recetaButton);
      recetaCard.appendChild(recetaImagen);
      recetaCard.appendChild(recetaCardBody);
      recetaContenedor.appendChild(recetaCard);
      resultado.appendChild(recetaContenedor);
      //   console.log(recetaImagen);
    });
  }

  function seleccionarReceta(id) {
    const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
    fetch(url)
      .then((respuesta) => respuesta.json())
      .then((resultado) => mostrarRecetaModal(resultado.meals[0]));
  }

  function mostrarRecetaModal(receta) {
    const { idMeal, strInstructions, strMeal, strMealThumb } = receta;
    //añadiendo contenido al modal
    const modalTittle = document.querySelector(".modal .modal-title");
    const modalBody = document.querySelector(".modal .modal-body");
    modalTittle.textContent = strMeal;
    modalBody.innerHTML = `
        <img class="img-fluid" src="${strMealThumb}" alt="receta ${strMeal}" />
        <h3 class="my-3">Instrucciones a continuación: </h3>
        <p>${strInstructions}</p>
        <h3 class="my-3">Ingredientes y Cantidad</h3>
    `;

    const listGroup = document.createElement("UL");
    listGroup.classList.add("list-group");
    // Mostrar cantidades e ingredientes
    for (let i = 1; i <= 20; i++) {
      if (receta[`strIngredient${i}`]) {
        const ingrediente = receta[`strIngredient${i}`];
        const cantidad = receta[`strMeasure${i}`];

        const ingredienteLi = document.createElement("LI");
        ingredienteLi.classList.add("list-group-item");
        ingredienteLi.textContent = `${ingrediente} - ${cantidad}`;

        listGroup.appendChild(ingredienteLi);
      }
    }

    modalBody.appendChild(listGroup);

    const modalFooter = document.querySelector(".modal-footer");
    limpiarHtml(modalFooter);

    // // Botones de cerrar y favorito
    const btnFavorito = document.createElement("BUTTON");
    btnFavorito.classList.add("btn", "btn-danger", "col");
    btnFavorito.textContent = existeStorage(idMeal)
      ? "Eliminar Favorito"
      : "Guardar Favorito";

    //manipulando datos en LocalStorage
    btnFavorito.onclick = function () {
      // console.log(existeStorage(idMeal));
      if (existeStorage(idMeal)) {
        eliminarFavorito(idMeal);
        btnFavorito.textContent = "Guardar Favorito";
        return;
      }
      agregarFavorito({
        id: idMeal,
        titulo: strMeal,
        img: strMealThumb,
      });
      btnFavorito.textContent = "Eliminar Favorito";
    };
    // ? // existeStorage(idMeal)
    //   "Eliminar Favorito"
    // : "Guardar Favorito";
    const btnCerrarModal = document.createElement("BUTTON");
    btnCerrarModal.classList.add("btn", "btn-secondary", "col");
    btnCerrarModal.textContent = "Cerrar";
    btnCerrarModal.onclick = function () {
      modal.hide();
    };
    modalFooter.appendChild(btnFavorito);
    modalFooter.appendChild(btnCerrarModal);
    // console.log(receta);
    //Mostrando el Modal
    modal.show();
  }

  function agregarFavorito(receta) {
    // console.log("agregando...");
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) ?? [];
    localStorage.setItem("favoritos", JSON.stringify([...favoritos, receta]));
  }

  function eliminarFavorito(id) {
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) ?? [];
    const nuevosFavoritos = favoritos.filter((favorito) => favorito.id !== id);
    localStorage.setItem("favoritos", JSON.stringify(nuevosFavoritos));
  }

  function existeStorage(id) {
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) ?? [];
    return favoritos.some((favorito) => favorito.id === id);
  }

  function limpiarHtml(selector) {
    // while (resultado.firstChild) {
    //   selector.removeChild(resultado.firstChild);
    // }
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  }
}

document.addEventListener("DOMContentLoaded", iniciarApp);
