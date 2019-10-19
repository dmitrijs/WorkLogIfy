import VueRouter from 'vue-router'
import Win2 from "./Win2.vue";

const Home = {
    template: `
  <div>
    <ul>
      <li><router-link to="/foo" id="foo">/foo</router-link></li>
      <li><router-link to="/bar" id="bar">/bar</router-link></li>
    </ul>
    <h1>Electron + Vue + Parcel</h1>
  </div>
`, title: 'Electron-Vue-Parcel-Boilerplate'
};
const Foo = {
    template: `
  <div>
    <ul>
      <li><router-link to="/">/</router-link></li>
      <li><router-link to="/bar">/bar</router-link></li>
    </ul>
    <h1>foo!</h1>
  </div>
`, title: 'Foo'
};

const Bar = {
    template: `
  <div>
    <ul>
      <li><router-link to="/foo">/foo</router-link></li>
      <li><router-link to="/">/</router-link></li>
    </ul>
    <h1>bar!</h1>
    <button @click="run()">run</button>
  </div>
`, title: 'Bar',
    methods: {
        run() {
            console.log('helloe', window.ipc);

            console.log(window.ipc.sendSync('synchronous-message', 'ping')) // prints "pong"

            window.ipc.on('asynchronous-reply', (event, arg) => {
                console.log(arg) // prints "pong"
            })
            window.ipc.send('asynchronous-message', 'ping')
        },
    }
};

const routes = [
    {path: '/', component: Home},
    {path: '/foo', component: Foo},
    {path: '/bar', component: Win2}
];

export function createRouter() {
    return new VueRouter({
        routes
    })
}
