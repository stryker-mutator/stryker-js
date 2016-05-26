enum MutantStatus {

  /**
   * The status of an untested Mutant.
   */
  UNTESTED,

  /**
   * The status of a killed Mutant.
   */
  KILLED,

  /**
   * The status of a survived Mutant.
   */
  SURVIVED,

  /**
   * The status of a timed out Mutant.
   */
  TIMEDOUT
}

export default MutantStatus;