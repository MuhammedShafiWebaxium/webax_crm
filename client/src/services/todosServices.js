import { axiosInstance } from '../utils/config';

export const createTodo = (formData) => {
  return axiosInstance.post('todos', formData);
};

export const getTodosDashboardData = () => {
  return axiosInstance.get('todos');
};

export const updateTodo = (id, formData) => {
  return axiosInstance.patch(`todos/${id}`, formData);
};

export const markTodoCompleted = (id) => {
  return axiosInstance.patch(`todos/${id}/complete`,);
};

export const deleteTodo = (id) => {
  return axiosInstance.delete(`todos/${id}`);
};
