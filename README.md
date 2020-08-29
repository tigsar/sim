# Simulation Model Engine
To build the project: npm run build

To run the test suit: npm run test

To run the launcher example: node build/examples/launcher/app.js > examples/launcher/reference.csv
```nomnoml
[<frame>Blocks diagram|
  [<abstract>CommonBlock |
    name
    parameterSignals
    inputSignals
    outputSignals
    parameter
    updatePeriod
    |
    checkInput(input)
    checkOutput(output)
    checkParameter(parameter)
  ]
  [<abstract>DirectBlock] -:> [CommonBlock]
  [<abstract>StateBlock] -:> [CommonBlock]
  [<abstract>StateSpaceBlock] -:> [StateBlock]
  
  [<abstract>StateBlock|
    stateSignals
    initialCondition
    inputRequired:boolean
    time:integer=0
    |
    update(state, input)
    output(state, input)
    checkState(state)
  ]
  
  [<abstract>DirectBlock||
    output(input)
  ]
  
  [<abstract>StateSpaceBlock|
    derivativesDef
    integrator:Integrator
    |
    derivative(state, input)
  ]
  
  [Timer] -:> [StateBlock]
  [Time] -:> [Timer]
  
  [TransferFunction] -:> [StateSpaceBlock]
  [FirstOrderTransferFunction] -:> [TransferFunction]
  [SecondOrderTransferFunction] -:> [TransferFunction]
  [Pid] -:> [TransferFunction]
  [ZeroOrderHold] -:> [StateBlock]
  
  [Plot] -:> [DirectBlock]
  [3DModel] -:> [DirectBlock]
]

[<frame>Integrators Diagram|
  [<abstract>Integrator|
    timeStep:Float
    derivateClass:StateSpaceBlock
    derivativesDef
    |
    integrate(state, input)
  ]
  [EulerIntegrator] -:> [Integrator]
  [RungeKuttaIntegrator] -:> [Integrator]
]

[<Solver Diagram>|
  [Solver
  |
  blocks:CommonBlock \[1..*\]
  links: Link \[0..*\]
  counter:Integer=0
  time:Float=0
  |
  +solve()
  +update()
  -getSignalWiring(block, signal)
  -getDependencies(block)
  -getDependents(block)
  -checkAlgebraicLoops()
  -resolveOrder()
  -computeUpdatePeriods(defaultUpdatePeriod)
  -isReady(block)
  ]
]
```