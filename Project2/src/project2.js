// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.
function GetTransform(positionX, positionY, rotation, scale) {
    const rad = rotation * Math.PI / 180;

    const scaleMatrix = [scale, 0, 0, 0, scale, 0, 0, 0, 1];
    const rotationMatrix = [Math.cos(rad), Math.sin(rad), 0, -Math.sin(rad), Math.cos(rad), 0, 0, 0, 1];
    const translationMatrix = [1, 0, 0, 0, 1, 0, positionX, positionY, 1];

    return ApplyTransform(ApplyTransform(scaleMatrix, rotationMatrix), translationMatrix);
}

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform(trans1, trans2) {
    const result = [];
    for (let i = 0; i < 9; i += 3) {
        result.push(...MatrixVectorMultiply(trans2, trans1.slice(i, i + 3)));
    }
    return result;
}

function MatrixVectorMultiply(matrix, vector) {
    return vector.map((_, i) =>
        vector.reduce((sum, v, j) => sum + v * matrix[i + 3 * j], 0)
    );
}
