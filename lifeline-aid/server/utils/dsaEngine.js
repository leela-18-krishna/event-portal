/**
 * LIFELINE DSA UTILITIES
 * Custom implementation of Data Structures for high-speed matching.
 */

// 1. Min-Heap for Priority Distance Matching
export class MinHeap {
  constructor() {
    this.heap = [];
  }

  // Add a donor with their distance
  push(donor) {
    this.heap.push(donor);
    this.bubbleUp();
  }

  bubbleUp() {
    let index = this.heap.length - 1;
    while (index > 0) {
      let parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex].distance <= this.heap[index].distance) break;
      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      index = parentIndex;
    }
  }

  // Get the closest donor
  pop() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();
    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.bubbleDown();
    return min;
  }

  bubbleDown() {
    let index = 0;
    const length = this.heap.length;
    while (true) {
      let left = 2 * index + 1;
      let right = 2 * index + 2;
      let swap = null;

      if (left < length) {
        if (this.heap[left].distance < this.heap[index].distance) swap = left;
      }
      if (right < length) {
        if (
          (swap === null && this.heap[right].distance < this.heap[index].distance) ||
          (swap !== null && this.heap[right].distance < this.heap[left].distance)
        ) {
          swap = right;
        }
      }

      if (swap === null) break;
      [this.heap[index], this.heap[swap]] = [this.heap[swap], this.heap[index]];
      index = swap;
    }
  }
}

// 2. Hashing Utility for Blood Compatibility
export const bloodCompatibility = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
};

/**
 * Returns a list of compatible blood types for a given seeker type.
 * Uses O(1) Hashing lookup.
 */
export const getCompatibleTypes = (seekerType) => {
  return bloodCompatibility[seekerType] || [];
};
