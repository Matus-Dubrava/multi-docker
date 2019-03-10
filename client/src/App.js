import React, { Component } from 'react';
import './App.css';
import { BrowserRouter, Route, Link } from 'react-router-dom';

import OtherPage from './OtherPage';
import Fib from './Fib';

class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <div className="App">
                    <header>
                        <h1>Welcome to Fibonacci calculator</h1>
                        <Link to="/">Home</Link>
                        <Link to="otherpage">Other Page</Link>
                    </header>
                    <div>
                        <Route exact path="/" component={Fib} />
                        <Route path="/otherpage" component={OtherPage} />
                    </div>
                </div>
            </BrowserRouter>
        );
    }
}

export default App;
