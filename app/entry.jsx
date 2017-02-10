'use strict';

import {v1} from 'uuid';
import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {Provider, connect} from 'react-redux';
import {Router, Route, browserHistory} from 'react-router';


// ACTION CONSTANTS
const NOTE_ADD = 'NOTE_ADD';
const NOTE_DEL = 'NOTE_DEL';

const LIST_ADD = 'LIST_ADD';
const LIST_ADD_NOTE = 'LIST_ADD_NOTE';
const LIST_DEL_NOTE = 'LIST_DEL_NOTE';
const LIST_DEL = 'LIST_DEL';

// MODELS
let createList = (title) => ({id: v1(), notes: [], title});
let createNote = (title, msg) => ({ id: v1(), title, msg });

// ACTIONS
let addNote = (note) => ({
  type: NOTE_ADD,
  payload: note,
});

let deleteNote = (note) => ({
  type: NOTE_DEL,
  payload: note,
});

let addList = (title) => ({
  type: LIST_ADD,
  payload: createList(title),
});

let delList = (list) => ({
  type: LIST_DEL,
  payload: list, 
});

let addListNote = (list, note) => ({
  type: LIST_ADD_NOTE,
  list,
  payload: note,
})

let delListNote = (list, note) => ({
  type: LIST_DEL_NOTE,
  list,
  payload: note,
})

// REDUCER
let notesReducer = (state=[], action) => {
  switch (action.type){
    case NOTE_ADD:
      return state.concat([action.payload]);
    case NOTE_DEL:
      return state.filter(note => !(note == action.payload));
    default:
      return state;
  }
};

let listsReducer = (state=[], action) => {
  switch(action.type) {
    case LIST_ADD:
      return state.concat([action.payload]);
    case LIST_DEL:
      return state.filter(list => !(list == action.payload));
    case LIST_ADD_NOTE:
      action.type = NOTE_ADD;
      return state.map(list => {
        if(action.list != list) return list;
        return Object.assign({}, list, {notes: notesReducer(list.notes, action)});
      });
    case LIST_DEL_NOTE:  
      action.type = NOTE_DEL;
      return state.map(list => {
        if(action.list != list) return list;
        return Object.assign({}, list, {notes: notesReducer(list.notes, action)});
      });
    default:
      return state;
  }
};

let reducer = (state={}, action) => {
  console.log(`(ACTION_TYPE) ${action.type}`);
  return {
    notes: notesReducer(state.notes, action),
    lists: listsReducer(state.lists, action),
  }
};

let store = createStore(reducer);
store.subscribe(() => {
  console.log('____NEW_STATE______', store.getState());
});

// dumb component
let NoteItem = ({dispatch, note, list}) => {
  let handleDelete = () => {
    if (list) return dispatch(delListNote(list, note));
    dispatch( deleteNote(note));
  }

  return (
    <li>
    <h2> {note.title} </h2>
    <p> {note.msg} </p>
    <button onClick={handleDelete}> DEL </button>
    </li>
  );
}

NoteItem = connect()(NoteItem);

const CreateNoteForm = ({callback}) => {
  let msg;
  let title;

  let handleSubmit = (e) => {
    e.preventDefault();
    if(title && msg) {
      callback(createNote(title.value, msg.value));
      title.value = '';
      msg.value = '';
    }
  }

  return (
    <form onSubmit={handleSubmit}>
    <label> Title </label>
    <input type="text" ref={input => title = input} />

    <label> Message </label>
    <input type="text" ref={input => msg = input} />

    <input type="submit" value="create note" />
    </form>
  );
}

let NotesList = ({notes, list}) => (
  <ol>
  { notes.map(item => <NoteItem key={item.id} note={item} list={list}/>) }
  </ol>
);

// SMART
class NoteContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {notes: []};
  }

  componentDidMount() {
    store.subscribe(() => {
      this.setState({notes: store.getState().notes});
    });
  }

  render(){
    return <NotesList notes={this.state.notes} />
  }
}

let CreateListForm = ({dispatch, callback}) => {
  let title;

  let handleSubmit = (e) => {
    e.preventDefault();
    if(title) {
      dispatch(addList(title.value));
      title.value = '';
    }
  }

  return (
    <form onSubmit={handleSubmit}>
    <label> Title </label>
    <input type="text" ref={input => title = input} />
    <input type="submit" value="create list" />
    </form>
  );
}

CreateListForm = connect()(CreateListForm);

let ListItem = ({dispatch, list}) => (
  <li>
  <h2> {list.title} </h2>
  <button onClick={() => dispatch(delList(list))}> DEL </button>
  <CreateNoteForm callback={note => dispatch(addListNote(list, note)) } />
  <NotesList notes={list.notes} list={list}/>
  </li>
);

ListItem = connect()(ListItem);

const ListList =  ({dispatch, lists}) => (
  <ul>
  {lists.map(item => <ListItem key={item.id} list={item} /> )}
  </ul>
);

class ListContianer extends React.Component {
  constructor(props){
    super(props);
    this.state = {lists: []};
  }

  componentDidMount(){
    store.subscribe(() => {
      console.log('new lists');
      this.setState({lists: store.getState().lists});
    });
  }

  render() {
    return <ListList lists={this.state.lists} />
  }
}

const App = () => (
  <div>
  <h2> lists </h2>
  <CreateListForm />
  <ListContianer />
  <h2> generic notes </h2>
  <CreateNoteForm callback={(note) => store.dispatch(addNote(note))} />
  <NoteContainer />
  </div>
);

// this is a slow and shitty way to render
// need to research better way to deal
ReactDOM.render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('root'));


