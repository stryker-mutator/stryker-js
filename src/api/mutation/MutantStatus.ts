enum MutantStatus {
  
  /**
   * The status of an untested Mutant.
   * @static
   */
  UNTESTED,

  /**
   * The status of a killed Mutant.
   * @static
   */
  KILLED,

  /**
   * The status of a survived Mutant.
   * @static
   */
  SURVIVED,

  /**
   * The status of a timed out Mutant.
   * @static
   */
  TIMEDOUT
}

export default MutantStatus;