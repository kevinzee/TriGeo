function countDefined(a) {
  let count = 0;
  for (const item of a) {
    if (item !== undefined) {
      count++;
    }
  }
  return count;
}

function degrees(a) {
  return a * 180 / Math.PI;
}

function radians(a) {
  return a * Math.PI / 180;
}

function check(n) {
  if (Number.isNaN(n)) {
    throw new Error('Invalid triangle! Try Again.');
  }
  return n;
}

class Triangle {
  constructor() {
    this.sides = [undefined, undefined, undefined];
    this.angles = [undefined, undefined, undefined];
  }

  clone() {
    const t2 = new Triangle();
    t2.sides = [...this.sides];
    t2.angles = [...this.angles];
    return t2;
  }

  solvedSideCount() {
    return countDefined(this.sides);
  }

  solvedAngleCount() {
    return countDefined(this.angles);
  }

  solve() {
    for(let i = 0; i < 3; i++) {
      const s = this.sides[i];
      if (s !== undefined && s <= 0) {
        throw new Error(`Sides must be positive`);
      }
      const a = this.angles[i];
      if (a !== undefined && (a <= 0 || a >= 180)) {
        throw new Error(`Angles must be between 0 and 180`);
      }
    }

    const solutions = [this];
    let limit = 3;
    while (limit-- > 0 && !this.isSolved()) {
      const alternate = this.step();
      if (alternate) {
        try {
          alternate.solve();
          solutions.push(alternate);
        } catch {
        }
      }
    }
    return solutions;
  }

  isSolved() {
    return this.solvedSideCount() === 3 && this.solvedAngleCount() === 3;
  }

  step() {
    const sideCount = this.solvedSideCount();
    const angleCount = this.solvedAngleCount();
    
    if (angleCount === 2) {
      return this.sumOfAngles();
    }

    if (sideCount === 3) {
      for (let i = 0; i < 3; i++) {
        if (this.angles[i] === undefined) {
          return this.lawOfCosinesForAngle(i);
        }
      }
    }

    if (sideCount === 2) {
      for (let i = 0; i < 3; i++) {
        if (this.angles[i] !== undefined && this.sides[i] === undefined) {
          return this.lawOfCosinesForSide(i);
        }
      }
    }

    for (let i = 0; i < 3; i++) {
      if (this.sides[i] !== undefined && this.angles[i] !== undefined) {
        return this.lawOfSines(i);
      }
    }

    throw new Error('could not solve');
  }

  sumOfAngles() {
    console.log('sum of angles');
    let total = 0;
    let missing;
    for (let i = 0; i < 3; i++) {
      if (this.angles[i] === undefined) {
        missing = i;
      } else {
        total += this.angles[i];
      }
    }
    if (total >= 180) {
      throw new Error('The total of your angle is more than 180 degrees! Try again.');
    }
    this.angles[missing] = 180 - total;
  }

  lawOfCosinesForAngle(i) {
    console.log('law of cosines for angle', i);
    const c = this.sides[i];
    const a = this.sides[(i + 1) % 3];
    const b = this.sides[(i + 2) % 3];
    const cos = (a * a + b * b - c * c) / (2 * a * b);
    if (cos <= -1 || cos >= 1) {
      throw new Error('Invalid triangle! Try Again.');
    }
    this.angles[i] = check(degrees(Math.acos(cos)));
  }

  lawOfCosinesForSide(i) {
    console.log('law of cosines for side', i);
    const theta = this.angles[i];
    if (theta <= 0 || theta >= 180) {
      throw new Error('Invalid triangle! Try Again.');
    }
    const a = this.sides[(i + 1) % 3];
    const b = this.sides[(i + 2) % 3];
    const c2 = a * a + b * b - 2 * a * b * Math.cos(radians(theta));
    this.sides[i] = check(Math.sqrt(c2));
  }

  lawOfSines(i) {
    console.log('law of sines', i);
    const r2 = this.sides[i] / Math.sin(radians(this.angles[i]));
    for (let j = 0; j < 3; j++) {
      if (this.sides[j] === undefined && this.angles[j] !== undefined) {
        this.sides[j] = r2 * Math.sin(radians(this.angles[j]));
        return;
      } else if (this.sides[j] !== undefined && this.angles[j] === undefined) {
        const sin = this.sides[j] / r2;
        let angle;
        if (Math.abs(1 - sin) < 0.01) {
          angle = 90;
        } else {
          angle = degrees(check(Math.asin(sin)));
        }
        this.angles[j] = angle;
        if (angle === 90) {
          return;
        }
        const alternate = this.clone();
        alternate.angles[j] = 180 - angle;
        return alternate;
      }
    }
    throw new Error('law of sines failed');
  }
}