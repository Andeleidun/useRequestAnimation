# useRequestAnimation Tutorial

### What is this?

An example of a custom hook for requestAnimationFrame.

### Where would you use this?

React components that use animation.

### Why requestAnimationFrame?

Client browsers handle the optimization, ensuring your render function is called between the vertical sync (vSync) timing set by the display refresh rate.

In addition, it's memory and battery performant, stopping animations in inactive tabs.

### Why a custom hook?

Custom hooks allow you to create reusable logic functions that use React hooks like useState and useEffect.