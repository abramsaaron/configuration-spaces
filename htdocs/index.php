<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <script src="lib.js?t=20210309"></script>
  <script src="app.js?t=20210309"></script>
  <link rel="stylesheet"
    href="https://maxst.icons8.com/vue-static/landings/line-awesome/line-awesome/1.3.0/css/line-awesome.min.css">
  <link rel="stylesheet" href="styles.css">
</head>

<body class="w-screen h-screen bg-black">
  <div id="navbar"
    class="fixed top-[10px] left-[10px] z-20 w-[calc(100vw-20px)] shadow-2xl rounded-xl h-[50px] m-0 bg-gray-500 text-white flex flex-row justify-center p-4">
    <div class="flex items-center justify-center p-2 font-sans text-2xl text-white whitespace-nowrap">Configuration
      Space Explorer</div>
    <div class="flex-grow"></div>
    <div class="flex flex-row items-center justify-start h-full menu">
      <div class="inline-block group"><button
          class="flex items-center px-3 py-2 text-white rounded-sm outline-none hover:bg-gray-400 focus:outline-none min-w-32"><span
            class="flex-1 pr-1 font-semibold">Choose graph</span> <span><svg
              class="w-4 h-4 transition duration-150 ease-in-out transform fill-current group-hover:-rotate-180"
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg></span></button>
        <ul
          class="absolute text-white transition duration-150 ease-in-out origin-top transform scale-0 bg-gray-500 rounded-sm group-hover:scale-100 min-w-32">
          <li class="relative px-3 py-2 rounded-sm hover:bg-gray-400"><button
              class="flex items-center w-full text-left outline-none focus:outline-none"><span
                class="flex-1 pr-1">Complete graphs</span> <span class="mr-auto"><svg
                  class="w-4 h-4 transition duration-150 ease-in-out fill-current" xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg></span></button>
            <ul
              class="absolute top-0 right-0 text-white transition duration-150 ease-in-out origin-top-left bg-gray-500 rounded-sm min-w-32">
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">K(2)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">K(3)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">K(4)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">K(5)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">K(6)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">K(7)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">K(8)</li>
            </ul>
          </li>
          <li class="relative px-3 py-2 rounded-sm hover:bg-gray-400"><button
              class="flex items-center w-full text-left outline-none focus:outline-none"><span
                class="flex-1 pr-1">Complete bipartite graphs</span> <span class="mr-auto"><svg
                  class="w-4 h-4 transition duration-150 ease-in-out fill-current" xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg></span></button>
            <ul
              class="absolute top-0 right-0 text-white transition duration-150 ease-in-out origin-top-left bg-gray-500 rounded-sm min-w-32">
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">K(1,1)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">K(1,2)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">K(1,3)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">K(1,4)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">K(1,5)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">K(1,6)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">K(1,7)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">K(1,8)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">K(1,9)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">K(1,10)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">K(2,2)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">K(2,3)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">K(2,4)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">K(2,5)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">K(2,6)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">K(3,3)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">K(3,4)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">K(4,4)</li>
            </ul>
          </li>
          <li class="relative px-3 py-2 rounded-sm hover:bg-gray-400"><button
              class="flex items-center w-full text-left outline-none focus:outline-none"><span class="flex-1 pr-1">Wheel
                graphs</span> <span class="mr-auto"><svg
                  class="w-4 h-4 transition duration-150 ease-in-out fill-current" xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg></span></button>
            <ul
              class="absolute top-0 right-0 text-white transition duration-150 ease-in-out origin-top-left bg-gray-500 rounded-sm min-w-32">
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">W(4)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">W(5)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">W(6)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">W(7)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">W(8)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">W(9)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">W(10)</li>
            </ul>
          </li>
          <li class="relative px-3 py-2 rounded-sm hover:bg-gray-400"><button
              class="flex items-center w-full text-left outline-none focus:outline-none"><span
                class="flex-1 pr-1">Cyclic graphs</span> <span class="mr-auto"><svg
                  class="w-4 h-4 transition duration-150 ease-in-out fill-current" xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg></span></button>
            <ul
              class="absolute top-0 right-0 text-white transition duration-150 ease-in-out origin-top-left bg-gray-500 rounded-sm min-w-32">
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">C(3)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">C(4)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">C(5)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">C(6)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">C(7)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">C(8)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">C(9)</li>
              <li class="px-3 py-2 hover:bg-gray-400 graphpicker">C(10)</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
    <div class="flex-grow"></div>
  </div>
  <div class="relative flex w-full h-full">
    <div class="absolute" id="warningWrapper"></div>
    <div class="canvas-container" id="graph"></div>
    <div class="canvas-container" id="configspace"></div>
  </div>
  <div class="fixed w-[100px] bg-gray-500 text-white rounded-xl top-[70px] left-[10px] flex flex-col items-center"><i
      id="graphtoggle" class="p-2 m-2 text-6xl text-white bg-black rounded-full las la-biohazard"></i> <i
      id="configspacetoggle" class="p-2 m-2 text-6xl text-white bg-black rounded-full las la-cubes"></i> <i
      id="robotstoggle" class="p-2 m-2 text-6xl text-white bg-black rounded-full las la-bug"></i> <i id="texttoggle"
      class="p-2 m-2 text-6xl text-white bg-black rounded-full las la-bone"></i> <i id="movetoggle"
      class="p-2 m-2 text-6xl text-white bg-black rounded-full las la-hand-pointer"></i> <i id="physicstoggle"
      class="p-2 m-2 text-6xl text-white bg-black rounded-full lab la-apple"></i></div>
  <div
    class="hidden fixed w-[calc(100vw-200px)] h-[60px] bg-gray-800 rounded-full bottom-[30px] left-[100px] flex flex-row justify-center items-center">
    <input id="historyslider" type="range" min="0" max="12" value="0" class="w-full mx-[30px]" step="1"></div>
  <div class="appearance-none fixed top-[60px] right-[10px]" id="lilgui"></div>
  <div style="display: none;"
    class="fixed bg-gray-200 rounded-lg w-[calc(100vw-200px)] max-h-[calc(100vh-200px)] overflow-y-auto top-[100px] left-[100px] p-8"
    id="info"></div>
  <div id="inputDiv"></div>
</body>

</html>