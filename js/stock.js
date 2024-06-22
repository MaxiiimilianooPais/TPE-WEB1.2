'use strict'
document.querySelector("#enviar").addEventListener("click", enviarDatos);
document.querySelector("#enviarTres").addEventListener("click", enviarTres);
// declaro las variables que luego voy a utilizar
let editando = false;
let idEditando = null;
//hago que al abrir la pagina ya se muestren los datos de la tabla
obtenerDatos();

//muestro la tabla con todos los datos de la api.
async function obtenerDatos() {
    let tabla = document.querySelector("#tablaProductos");
    tabla.innerHTML = "";
    try {
        let res = await fetch('https://6663a312932baf9032a8ad46.mockapi.io/infoproductos'); // GET url
        let json = await res.json(); // texto json a objeto

        for (let infoproductos of json) {
            let id = infoproductos.id;
            let producto = infoproductos.producto;
            let precio = infoproductos.precio;
            let cantidad = infoproductos.cantidad;

            // Agregar filas con botones de Editar y Borrar
            tabla.innerHTML += `<tr data-id="${id}">
                                    <td class="producto">${producto}</td>
                                    <td class="precio">${precio}</td>
                                    <td class="cantidad">${cantidad}</td>
                                    <td>
                                        <button class="editar">Editar</button>
                                        <button class="borrar">Borrar</button>
                                    </td>
                                </tr>`;
        }

        // Añadir eventos a los botones Editar y Borrar
        document.querySelectorAll(".borrar").forEach(button => {
            button.addEventListener("click", async (event) => {
                //  encuentra el ID único asociado a la fila de la tabla en la que se hizo clic el botón.
                let id = event.target.closest("tr").getAttribute("data-id");
                // a la funcion borrar producto le pasa el id de cada producto
                await borrarProducto(id);
                obtenerDatos();
            });
        });

        document.querySelectorAll(".editar").forEach(button => {
            button.addEventListener("click", async (event) => {
                let tr = event.target.closest("tr");
                // obtiene el valor del atributo `data-id` del `<tr>`
                let id = tr.getAttribute("data-id");
                // Llama a la función `llenarFormulario`, pasando el `<tr>` y el `id` como argumentos
                llenarFormulario(tr, id);
            });
        });

    } catch (error) {
        console.log(error);
    }
}

async function enviarDatos() {
    let producto = document.querySelector("#txtProducto").value;
    let precio = document.querySelector("#txtPrecio").value;
    let cantidad = document.querySelector("#txtStock").value;

    let infoproductos = {
        "producto": producto,
        "precio": precio,
        "cantidad": cantidad
    };

    try {
        //editando pasa a ser verdadera en la funcion llenarFormulario
        if (editando) {
            let res = await fetch(`https://6663a312932baf9032a8ad46.mockapi.io/infoproductos/${idEditando}`, {
                "method": "PUT",
                "headers": { "content-type": "application/json" },
                "body": JSON.stringify(infoproductos)
            });

            // si salio bien, reseteo el formulario y actualizo la tabla
            if (res.ok) {
                resetFormulario();
                obtenerDatos();
            }
        } else { // si no se esta editando entonces estoy enviado algo nuevo
            let res = await fetch('https://6663a312932baf9032a8ad46.mockapi.io/infoproductos', {
                "method": "POST",
                "headers": { "content-type": "application/json" },
                "body": JSON.stringify(infoproductos)
            });

            // Actualizar la tabla y reseteo el formulario  después de agregar un nuevo producto exitosamente
            if (res.ok) {
                obtenerDatos();
                resetFormulario();
            }
        }

    } catch (error) {
        console.log(error);
    }
}
// en esta funcion envio tres veces el mismo producto
async function enviarTres() {
    for (let i = 0; i < 3; i++) {
        await enviarDatos();
    }
}

async function borrarProducto(id) {
    try {
        await fetch(`https://6663a312932baf9032a8ad46.mockapi.io/infoproductos/${id}`, {
            method: "DELETE"
        });
    } catch (error) {
        console.log(error);
    }
}
// esta funcion pasa los valores de la tabla al formulario, haciendo que sea mas visible lo que estoy editando
function llenarFormulario(tr, id) {
    document.querySelector("#txtProducto").value = tr.querySelector(".producto").innerText;
    document.querySelector("#txtPrecio").value = tr.querySelector(".precio").innerText;
    document.querySelector("#txtStock").value = tr.querySelector(".cantidad").innerText;
    // Cambio los el contenido del boton enviar y el contenido del titulo del form
    //para que indique que se esta actualizando
    document.querySelector("#estadoStock").innerHTML = 'Usted esta actualizando el producto seleccionado';
    document.querySelector("#enviar").value = "Actualizar";

    //editando pasa a ser verdadera, para que entre en la funcion enviarDatos.
    editando = true;
    idEditando = id;
}

// funcion para resetear al estado original del form y sus funciones
function resetFormulario() {
    document.querySelector("#txtProducto").value = "";
    document.querySelector("#txtPrecio").value = "";
    document.querySelector("#txtStock").value = "";
    document.querySelector("#estadoStock").innerHTML = 'Ingrese los datos del Producto';
    document.querySelector("#enviar").value = "Enviar";

    //editando pasa a ser falsa de vuelta.
    editando = false;
    //borro cualquier id que haya quedado guardado
    idEditando = null;

}
