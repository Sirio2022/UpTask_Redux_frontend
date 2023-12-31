import { createSlice } from '@reduxjs/toolkit';
import clienteAxios from '../config/clienteAxios';
import socket from '../config/socket';

const initialState = {
  proyectos: [],
  proyecto: {},
  modalBuscadorProyectos: false,
  tarea: {},
  alerta: {},
  modalFormularioTarea: false,
  colaborador: {},
};

const proyectosSlice = createSlice({
  name: 'proyectos',
  initialState,
  reducers: {
    obtenerProyectos: (state, action) => {
      state.proyectos = action.payload;
    },
    crearProyecto: (state, action) => {
      state.proyectos = [...state.proyectos, action.payload];
    },

    obtenerProyecto: (state, action) => {
      state.proyecto = action.payload;
    },
    eliminarProyecto: (state, action) => {
      state.proyectos = state.proyectos.filter(
        (proyecto) => proyecto._id !== action.payload
      );
    },
    actualizarProyecto: (state, action) => {
      state.proyectos = state.proyectos.map((proyecto) =>
        proyecto._id === action.payload._id ? action.payload : proyecto
      );
    },

    mostrarAlerta: (state, action) => {
      state.alerta = action.payload;
    },
    mostrarModalFormularioTarea: (state, action) => {
      state.modalFormularioTarea = action.payload;
    },
    mostrarModalBuscadorProyectos: (state, action) => {
      state.modalBuscadorProyectos = action.payload;
    },
    crearTarea: (state, action) => {
      state.proyecto = {
        ...state.proyecto,
        tareas: [...state.proyecto.tareas, action.payload],
      };
    },
    editarTarea: (state, action) => {
      state.tarea = action.payload;
    },
    actualizarTarea: (state, action) => {
      state.proyecto = {
        ...state.proyecto,
        tareas: state.proyecto.tareas.map((tarea) =>
          tarea._id === action.payload._id ? action.payload : tarea
        ),
      };
    },
    eliminarTarea: (state, action) => {
      state.proyecto = {
        ...state.proyecto,
        tareas: state.proyecto.tareas.filter(
          (tarea) => tarea._id !== action.payload
        ),
      };
    },
    findColaborador: (state, action) => {
      state.colaborador = action.payload;
    },
    eliminarColaborador: (state, action) => {
      state.proyecto = {
        ...state.proyecto,
        colaboradores: state.proyecto.colaboradores.filter(
          (colaborador) => colaborador._id !== action.payload
        ),
      };
      state.colaborador = {};
    },
    actualizarProyectoColaborador: (state, action) => {
      state.proyecto = {
        ...state.proyecto,
        colaboradores: state.proyecto.colaboradores.map((colaborador) =>
          colaborador._id === action.payload._id ? action.payload : colaborador
        ),
      };
      state.colaborador = {};
    },
  },
});

export const {
  obtenerProyectos,
  obtenerProyecto,
  crearProyecto,
  eliminarProyecto,
  actualizarProyecto,
  mostrarAlerta,
  mostrarModalFormularioTarea,
  mostrarModalBuscadorProyectos,
  crearTarea,
  editarTarea,
  actualizarTarea,
  eliminarTarea,
  findColaborador,
  eliminarColaborador,
  actualizarProyectoColaborador,
} = proyectosSlice.actions;

export default proyectosSlice.reducer;

export const cerrarSesionProyectosAction = () => (dispatch) => {
  dispatch(obtenerProyectos([]));
  dispatch(obtenerProyecto({}));
};

export const mostrarAlertaAction = (alerta) => (dispatch) => {
  dispatch(mostrarAlerta(alerta));
  setTimeout(() => {
    dispatch(mostrarAlerta({}));
  }, 3000);
};

export const mostrarModalFormularioTareaAction = () => (dispatch) => {
  dispatch(mostrarModalFormularioTarea(true));
  dispatch(editarTarea({}));
};

export const mostrarModalFormularioTareaCloseAction = () => (dispatch) => {
  dispatch(mostrarModalFormularioTarea(false));
  dispatch(editarTarea({}));
};

export const mostrarModalBuscadorProyectosAction = () => (dispatch) => {
  dispatch(mostrarModalBuscadorProyectos(true));
};

export const mostrarModalBuscadorProyectosCloseAction = () => (dispatch) => {
  dispatch(mostrarModalBuscadorProyectos(false));
};

export const crearProyectoAction = (proyecto) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };
  try {
    const { data } = await clienteAxios.post('/proyectos', proyecto, config);
    dispatch(crearProyecto(data.proyecto));
    dispatch(
      mostrarAlertaAction({
        msg: data.msg,
        error: false,
      })
    );
  } catch (error) {
    dispatch(
      mostrarAlertaAction({
        msg:
          error.response && error.response.data.msg
            ? error.response.data.msg
            : error.message,
        error: true,
      })
    );
  }
};

export const obtenerProyectosAction = () => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };
  try {
    const { data } = await clienteAxios.get('/proyectos', config);
    dispatch(obtenerProyectos(data));
  } catch (error) {
    dispatch(
      mostrarAlertaAction({
        msg:
          error.response && error.response.data.msg
            ? error.response.data.msg
            : error.message,
        error: true,
      })
    );
  }
};

export const obtenerProyectoAction = (id) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };
  try {
    const { data } = await clienteAxios.get(`/proyectos/${id}`, config);

    dispatch(obtenerProyecto(data));

    socket.emit('abrir-proyecto', id);
  } catch (error) {
    dispatch(
      mostrarAlertaAction({
        msg:
          error.response && error.response.data.msg
            ? error.response.data.msg
            : error.message,
        error: true,
      })
    );
  }
};

export const actualizarProyectoAction = (proyecto) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };
  try {
    const { data } = await clienteAxios.put(
      `/proyectos/${proyecto._id}`,
      proyecto,
      config
    );

    dispatch(actualizarProyecto(data.proyectoActualizado));
    dispatch(
      mostrarAlertaAction({
        msg: data.msg,
        error: false,
      })
    );
  } catch (error) {
    dispatch(
      mostrarAlertaAction({
        msg:
          error.response && error.response.data.msg
            ? error.response.data.msg
            : error.message,
        error: true,
      })
    );
  }
};

export const eliminarProyectoAction = (id) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };
  try {
    const { data } = await clienteAxios.delete(`/proyectos/${id}`, config);
    dispatch(eliminarProyecto(id));
    dispatch(
      mostrarAlertaAction({
        msg: data.msg,
        error: false,
      })
    );
  } catch (error) {
    dispatch(
      mostrarAlertaAction({
        msg:
          error.response && error.response.data.msg
            ? error.response.data.msg
            : error.message,
        error: true,
      })
    );
  }
};

export const crearTareaAction = (tarea) => async (dispatch) => {
  if (tarea?.id) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    };

    try {
      const { data } = await clienteAxios.put(
        `/tareas/${tarea.id}`,
        tarea,
        config
      );

      socket.emit('actualizar-tarea', data.tarea);

      dispatch(
        mostrarAlertaAction({
          msg: data.msg,
          error: false,
        })
      );
    } catch (error) {
      console.log(error);
      dispatch(
        mostrarAlertaAction({
          msg:
            error.response && error.response.data.msg
              ? error.response.data.msg
              : error.message,
          error: true,
        })
      );
    }
  } else {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      };
      const { data } = await clienteAxios.post('/tareas', tarea, config);

      socket.emit('nueva-tarea', data.tarea);

      dispatch(
        mostrarAlertaAction({
          msg: data.msg,
          error: false,
        })
      );
    } catch (error) {
      console.log(error);
      dispatch(
        mostrarAlertaAction({
          msg:
            error.response && error.response.data.msg
              ? error.response.data.msg
              : error.message,
          error: true,
        })
      );
    }
  }
};

export const eliminarTareaAction = (id) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };
  try {
    const { data } = await clienteAxios.delete(`/tareas/${id}`, config);

    socket.emit('eliminar-tarea', data.tarea);

    dispatch(
      mostrarAlertaAction({
        msg: data.msg,
        error: false,
      })
    );
  } catch (error) {
    console.log(error);
    dispatch(
      mostrarAlertaAction({
        msg:
          error.response && error.response.data.msg
            ? error.response.data.msg
            : error.message,
        error: true,
      })
    );
  }
};

export const handleModalEditarTareaAction = (tarea) => (dispatch) => {
  dispatch(editarTarea(tarea));
  dispatch(mostrarModalFormularioTarea(true));
};

export const buscarColaboradorAction = (email) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };
  try {
    const { data } = await clienteAxios.post(
      `/proyectos/colaboradores`,
      { email },
      config
    );
    dispatch(findColaborador(data));
    dispatch(
      mostrarAlertaAction({
        msg: data.msg,
        error: false,
      })
    );
  } catch (error) {
    console.log(error);
    dispatch(
      mostrarAlertaAction({
        msg:
          error.response && error.response.data.msg
            ? error.response.data.msg
            : error.message,
        error: true,
      })
    );
    dispatch(findColaborador({}));
  }
};

export const agregarColaboradorAction =
  (email) => async (dispatch, getState) => {
    const { _id } = getState().proyectos.proyecto;

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      };
      const { data } = await clienteAxios.post(
        `/proyectos/colaboradores/${_id}`,
        { email },
        config
      );

      dispatch(actualizarProyectoColaborador(data.usuario));
      dispatch(
        mostrarAlertaAction({
          msg: data.msg,
          error: false,
        })
      );
      dispatch(findColaborador({}));
    } catch (error) {
      console.log(error);
      dispatch(
        mostrarAlertaAction({
          msg:
            error.response && error.response.data.msg
              ? error.response.data.msg
              : error.message,
          error: true,
        })
      );
      dispatch(findColaborador({}));
    }
  };

export const eliminarColaboradorAction =
  (idColaborador) => async (dispatch, getState) => {
    const { _id } = getState().proyectos.proyecto;

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      };
      const { data } = await clienteAxios.delete(
        `/proyectos/colaboradores/${_id}/${idColaborador}`,
        config
      );

      dispatch(eliminarColaborador(idColaborador));
      dispatch(
        mostrarAlertaAction({
          msg: data.msg,
          error: false,
        })
      );
    } catch (error) {
      dispatch(
        mostrarAlertaAction({
          msg:
            error.response && error.response.data.msg
              ? error.response.data.msg
              : error.message,
          error: true,
        })
      );
    }
  };

export const completarTareaAction = (idTarea) => async (dispatch) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    };
    const { data } = await clienteAxios.post(
      `/tareas/estado/${idTarea}`,
      {},
      config
    );

    socket.emit('completar-tarea', data);

    dispatch(
      mostrarAlertaAction({
        msg: data.msg,
        error: false,
      })
    );
  } catch (error) {
    console.log(error.response);
  }
};
