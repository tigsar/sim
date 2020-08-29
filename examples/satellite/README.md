What would be nice is:
1) Be able to define 3D geometries from JSON or other objects (giving shape and density information)
2) Automatic computations of mass, moments of inertia and CM
3) Allow to perform rotations, translations and shrinkings of shapes wrt other shapes
  - solar array panels deployment
  - solar array panels steering
  - antenna deployment
  - antenna steering
  - propergol mass consumption
  - reaction wheels
4) 3D model vs dynamic model interraction
  - Dynamic model needs to know the mass, inertia and CM in order to be evaluated properly
  - 3D model needs to know all information from the dynamic model in order to rotate the shapes and so on...
  - Obviously there is coupling between the 3D model and the dynamic model
  - What can be put in place is something like this. All movable parts of the 3D model are represented by
    state signals. That's obvious that the initial state of the dynamic model will be given, thus also
    the initial 3D configuration. From that initial 3D configuration we can evaluate the mass, momentum
    of inertia, etc. This information is feed back to the dynamic model which computes the state at the
    next time instant.
  - Interfaces identification
    a) 3D model
      constructor(params)
      update(state)
      getMass()
      getMomentumOfInertia()
      getCm()
    b) Dynamic Model
      constructor(...)
        this.m3d = new Model3D(params);
        this.m3d.update(initialState);
      update()
        let mass = this.m3d.getMass();
        let momentumOfInertia = this.m3d.getMomentumOfInertia();
        ...
        this.m3d.update(newState);
    c) Think a way to decouple (introduce interface)
    d) A 3D model could derived from a Direct block which has as input the position of all movable parts.
       And as output it will provide the mass, the momentum of inertia, etc.
       This type of blocks shall have also a kind of rendering method