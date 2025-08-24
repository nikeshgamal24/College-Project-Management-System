const mongoose = require("mongoose");
const Defense = require("../../models/academic/Defense");
const Project = require("../../models/academic/Project");
const Student = require("../../models/user/Student");
const Evaluator = require("../../models/user/Evaluator");
const Room = require("../../models/system/Room");
const Evaluation = require("../../models/academic/Evaluation");
const { AppError } = require("../../middleware/errorHandler");
const {
  determineDefenseType,
} = require("../helpers/evaluation/determineDefenseType");
const { ObjectId } = require("mongodb");
const midJudgementConfig = require("../../config/constants/midJudgementConfig");
const progressStatusEligibilityCode = require("../../config/constants/progressStatusEligibilityCode");
const {
  updateProjectFirstProgressStatus,
} = require("../helpers/project/updateProjectFirstProgressStatus");
const {
  updateMinorProgressStatus,
} = require("../helpers/project/updateMinorProgressStatus");
const {
  updateMajorProgressStatus,
} = require("../helpers/project/updateMajorProgressStatus");
const {
  initializeEventTypeBasedOnBatch,
} = require("../helpers/project/initializeEventTypeBasedOnBatch");
const eventStatusList = require("../../config/constants/eventStatusList");
const proposalJudgementConfig = require("../../config/constants/proposalJudgementConfig");
const defenseTypeCode = require("../../config/constants/defenseTypeCode");
const { finalJudgementConfig } = require("../../config/constants/finalJudgementConfig");
const {
  determineConflictExistsStatus,
} = require("../helpers/evaluation/determineConflictExistsStatus");
const {
  determineAllProjectsEvaluatedByEvaluator,
} = require("../helpers/evaluation/determineAllProjectsEvaluatedByEvaluator");
// require("dotenv").config();

// const Queue = require("bull");
// const {
//   REDIS_URI,
//   REDIS_PORT,
//   REDIS_TOKEN,
// } = require("../config/redisCredentials");

// const evaluatorQueue = new Queue("evaluatorqueue", {
//   redis: {
//     port: REDIS_PORT,
//     host: REDIS_URI,
//     password: REDIS_TOKEN,
//     tls: {},
//   },
// });

const getDefenseBydId = async (req, res) => {
  // Check if ID is provided
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Defense ID required." });
  }

  try {
    const defense = await Defense.findById(req.params.id)
      .populate({
        path: "rooms",
        populate: [
          { path: "evaluators" },
          {
            path: "projects",
            populate: { path: "teamMembers" },
          },
        ],
      })
      .populate("event")
      .populate("evaluations");

    // // Find event by ID and populate the relevant fields
    // const defense = await Defense.findById(req.params.id)
    //   .populate("rooms")
    //   .populate("event")
    //   .populate("evaluations");

    // Check if event exists
    if (!defense) {
      return res.sendStatus(204);
    }

    const defenseType = defense.defenseType;
    let allRoomsCompleted = true;

    // Go through each room
    for (const room of defense.rooms) {
      // Fetch the projects for the room in one query
      const projects = await Project.find({ _id: { $in: room.projects } });
      // console.log("🚀 ~ getDefenseBydId ~ projects:", projects);

      // for (const project of projects) {
      //   for (const defenseObj of project[defenseType].defenses) {
      //     if (!defenseObj.isGraded) {
      //       isGradedStatus = false;
      //       break;
      //     }
      //   }
      //   if (!isGradedStatus) break;
      // }

      let isGradedStatus = true;
      for (const project of projects) {
        if (
          !project[defenseType].defenses.every((defenseObj) => {
            // console.log("🚀 ~ getDefenseBydId ~ defenseObj:", defenseObj);
            return defenseObj.isGraded;
          })
        ) {
          isGradedStatus = false;
          break;
        }
      }

      // console.log("🚀 ~ getDefenseBydId ~ isGradedStatus:", isGradedStatus);
      // If all projects in the room are graded, mark the room as completed
      if (isGradedStatus) {
        room.isCompleted = true;
        // console.log("🚀 ~ getDefenseBydId ~ room:", room);
      } else {
        allRoomsCompleted = false;
      }

      // Save the updated room
      await room.save();
      // console.log("🚀 ~ getDefenseBydId ~ room:", room);
    }

    // Update the defense status if all rooms are completed
    console.log("🚀 ~ getDefenseBydId ~ allRoomsCompleted:", allRoomsCompleted);
    if (allRoomsCompleted) {
      defense.status = eventStatusList.complete; // 105 i.e. complete
    }

    // Populate evaluators and projects within the rooms for the response
    // await Promise.all(
    //   defense.rooms.map(async (room) => {
    //     await room.populate({
    //       path: "projects",
    //       populate: { path: "teamMembers" },
    //     });
    //     await room.populate("evaluators");
    //   })
    // );

    // Save the updated defense
    await defense.save();

    // Send response
    return res.status(200).json({
      data: defense,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.status(500).json({ message: "Server error." });
  }
};

const getProjectBydId = async (req, res) => {
  // Check if ID is provided
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Defense ID required." });
  }

  try {
    // Find event by ID and populate the author field
    const project = await Project.findById(req.params.id)
      .populate("teamMembers")
      .populate("event")
      .populate({
        path: "proposal.evaluations",
        populate: { path: "evaluator" },
      })
      .populate({
        path: "mid.evaluations",
        populate: { path: "evaluator" },
      })
      .populate({
        path: "final.evaluations",
        populate: { path: "evaluator" },
      });

    // Check if event exists
    if (!project) {
      return res.sendStatus(204);
    }
    // Send response
    return res.status(200).json({
      data: project,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.status(500).json({ message: "Server error." });
  }
};

const submitEvaluation = async (req, res) => {
  // Start a MongoDB session for transaction
  const session = await mongoose.startSession();

  try {
    // Start transaction
    await session.withTransaction(async () => {
      //request body received
      const {
        individualEvaluation,
        projectEvaluation,
        projectId,
        evaluatorId,
        defenseId,
        eventId,
        evaluationType,
        roomId,
      } = req.body;

      if (
        !Array.isArray(individualEvaluation) ||
        !individualEvaluation.length ||
        !projectEvaluation ||
        !projectId ||
        !evaluatorId ||
        !defenseId ||
        !eventId ||
        !roomId
      ) {
        // Abort transaction by throwing error
        throw new AppError("Required Credentials Missing", 400);
      }

      // 🔒 ATOMIC OPERATION: Update specific evaluator's submission status
      const updateResult = await Project.findOneAndUpdate(
        {
          _id: projectId,
          [`${evaluationType}.defenses.evaluators.evaluator`]: evaluatorId,
          [`${evaluationType}.defenses.evaluators.hasEvaluated`]: false // ✅ Only update if not already submitted
        },
        {
          $set: {
            [`${evaluationType}.defenses.$.evaluators.$[elem].hasEvaluated`]: true
          }
        },
        {
          arrayFilters: [{ "elem.evaluator": evaluatorId }], // ✅ Target specific evaluator
          new: true, // ✅ Return updated document
          session: session // ✅ Use the transaction session
        }
      );

      // 🚫 DUPLICATE DETECTION: Reject if evaluator already submitted
      if (!updateResult) {
        // Abort transaction by throwing error
        throw new AppError("Evaluation already submitted by this evaluator or evaluator not found", 409);
      }

      console.log("🚀 ~ submitEvaluation ~ atomic update successful for evaluator:", evaluatorId);

      // 📊 WORK WITH FRESH DATA: Use the updated document
      const project = updateResult;
      const defense = await Defense.findOne({ _id: defenseId }).session(session);
      const room = await Room.findOne({ _id: roomId }).session(session);

      // Check for evaluation conflicts
    const matchingEvaluations = await Evaluation.find({
        _id: { $in: project[evaluationType].evaluations },
        project: projectId,
        defense: defenseId,
      }).session(session);

    if (matchingEvaluations.length) {
          const conflictExists = determineConflictExistsStatus({
            matchingEvaluations: matchingEvaluations,
            individualEvaluation: individualEvaluation,
            projectEvaluation: projectEvaluation,
          });

          if (conflictExists) {
            // Abort transaction by throwing error - no need to manually rollback
            throw new AppError("Conflict data detected - evaluation reverted", 409);
          }
        }

      // Find the specific defense object for this evaluator
      const projectSubEvent = project[evaluationType];
      const obj = projectSubEvent.defenses.find((defense) => {
        return defense.evaluators.some((evaluator) => {
          return evaluatorId === evaluator.evaluator.toString();
        });
      });

      if (!obj) {
        // Abort transaction by throwing error
        throw new AppError("Defense Not Found", 404);
      }

      console.log("🚀 ~ submitEvaluation ~ defense object found:", obj._id);

      // 🎯 CHECK COMPLETION: Determine if all evaluators have submitted
      const allEvaluatedResult = obj.evaluators.every(
        (evaluatorObj) => evaluatorObj.hasEvaluated
      );

      console.log("🚀 ~ submitEvaluation ~ all evaluators completed:", allEvaluatedResult);

      // 🏆 DEFENSE COMPLETION: If all evaluators done, mark defense as complete
      if (allEvaluatedResult && !obj.isGraded) {
        console.log("🚀 ~ All evaluators completed - updating defense status");

        // Atomically mark defense as graded - within transaction
        await Project.findOneAndUpdate(
          {
            _id: projectId,
            [`${evaluationType}.defenses._id`]: obj._id
          },
          {
            $set: {
              [`${evaluationType}.defenses.$.isGraded`]: true,
              [`${evaluationType}.hasGraduated`]: true
            }
          },
          { session: session }
        );

        // Update student progress status - within transaction
        await updateStudentProgressStatusWithSession(updateResult, evaluationType, projectEvaluation, session);

        console.log("🚀 ~ Working Before checkAndUpdateDefenseCompletionWithSession");

        // Check and update overall defense completion - within transaction
        await checkAndUpdateDefenseCompletionWithSession(defenseId, evaluationType, session);
          
        // Clear evaluator access codes - within transaction
        await clearEvaluatorAccessCodesWithSession(evaluatorId, defenseId, roomId, evaluationType, session);
      }

      // 💾 CREATE EVALUATION RECORD: Store the evaluation details - within transaction
      const newEvaluation = await createEvaluationRecordWithSession({
        individualEvaluation,
        projectEvaluation,
        projectId,
        evaluatorId,
        defenseId,
        eventId,
        evaluationType,
        session
      });

      console.log("🚀 ~ submitEvaluation ~ evaluation created successfully:", newEvaluation._id);

      // Store the result to be returned after transaction completes
      // We don't return inside the transaction to ensure it completes
      req.transactionResult = {
        success: true,
        message: "Evaluation submitted successfully",
        data: newEvaluation,
        evaluatorId: evaluatorId,
        defenseCompleted: allEvaluatedResult,
        timestamp: new Date().toISOString()
      };
    });

    // Transaction successfully committed
    return res.status(201).json(req.transactionResult);

  } catch (err) {
    // Transaction aborted or other error
    console.error(`Evaluation submission error: ${err.message}`);
    console.error(`Stack trace: ${err.stack}`);

    // Determine appropriate status code
    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message: err.message || "Internal server error during evaluation submission",
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      timestamp: new Date().toISOString()
    });
  } finally {
    // Always end the session
    session.endSession();
  }
};

// Function to handle submission of evaluations
// const submitEvaluationThroughQueue = async (req, res) => {
//   try {
//     console.log("🚀 ~ submitEvaluationThroughQueue ~ evaluatorQueue:");
//     console.log("🚀 ~ redis token  ~ redis host:", REDIS_URI);
//     console.log("🚀 ~ redis token  ~ redis port:", REDIS_PORT);
//     console.log("🚀 ~ redis token  ~ redis password:", REDIS_TOKEN);

//     // Add the evaluation task to the queue
//     // Add the evaluation task to the queue
//     const job = await evaluatorQueue.add(
//       {
//         userId: req.userId,
//         evaluationData: req.body,
//       },
//       { delay: 2000, attempts: 1 }
//     );
//     // Wait for the job to complete and get the result
//     job
//       .finished()
//       .then((statusCode) => {
//         console.log(
//           "🚀 ~ submitEvaluationThroughQueue ~ statusCode:",
//           statusCode
//         );
//         return res.status(statusCode).json({
//           message: "Created Successfully",
//         });
//       })
//       .catch((err) => {
//         console.error(`Job failed: ${err.message}`);
//         return res.sendStatus(500);
//       });
//   } catch (err) {
//     console.error(`Error message: ${err.message}`);
//     res.sendStatus(400);
//   }
// };
// 🔧 HELPER FUNCTIONS FOR CONCURRENCY-SAFE EVALUATION SUBMISSION

/**
 * Updates student progress status based on evaluation judgment with transaction support
 * @param {Object} project - Project document
 * @param {String} evaluationType - proposal, mid, or final
 * @param {Object} projectEvaluation - Evaluation data with judgment
 * @param {Object} session - MongoDB session for transaction
 */
const updateStudentProgressStatusWithSession = async (project, evaluationType, projectEvaluation, session) => {
  try {
    const projectJudgement = projectEvaluation.judgement;

    // Determine if judgment is passing
    const isPassingJudgment = (
      projectJudgement === proposalJudgementConfig.ACCEPTED ||
      projectJudgement === proposalJudgementConfig["ACCEPTED-CONDITIONALLY"] ||
      projectJudgement === midJudgementConfig["PROGRESS-SATISFACTORY"] ||
      projectJudgement === midJudgementConfig["PROGRESS-SEEN"] ||
      projectJudgement === midJudgementConfig["PROGRESS-NOT-SATISFACTORY"] ||
      projectJudgement === finalJudgementConfig.ACCEPTED ||
      projectJudgement === finalJudgementConfig["ACCEPTED-CONDITIONALLY"]
    );

    if (isPassingJudgment) {
      // Update student progress for passing judgment
      const studentUpdatePromises = project.teamMembers.map(async (studentId) => {
        const student = await Student.findById(studentId);
        if (!student) return;

        const eventType = initializeEventTypeBasedOnBatch(student.batchNumber);

        switch (eventType) {
          case "0":
            student.progressStatus = updateProjectFirstProgressStatus(
              progressStatusEligibilityCode[evaluationType].defensePass
            );
            break;
          case "1":
            student.progressStatus = updateMinorProgressStatus(
              progressStatusEligibilityCode[evaluationType].defensePass
            );
            break;
          case "2":
            student.progressStatus = updateMajorProgressStatus(
              progressStatusEligibilityCode[evaluationType].defensePass
            );
            break;
        }

        // If final evaluation, complete the project
        if (evaluationType === defenseTypeCode.final) {
          student.isAssociated = false;
          student.project = undefined;
          await Project.findByIdAndUpdate(project._id, {
            status: eventStatusList.complete
          }, { session });
        }

        return student.save({ session });
      });

      await Promise.all(studentUpdatePromises);
    } else {
      // Handle failing judgments
      const studentUpdatePromises = project.teamMembers.map(async (studentId) => {
        const student = await Student.findById(studentId);
        if (!student) return;

        const eventType = initializeEventTypeBasedOnBatch(student.batchNumber);

        // Handle re-defense, absent, or rejected judgments
        if (
          projectJudgement === proposalJudgementConfig["RE-DEFENSE"] ||
          projectJudgement === finalJudgementConfig["RE-DEFENSE"] ||
          projectJudgement === proposalJudgementConfig.ABSENT ||
          projectJudgement === midJudgementConfig.ABSENT ||
          projectJudgement === finalJudgementConfig.ABSENT
        ) {
          switch (eventType) {
            case "0":
              student.progressStatus = updateProjectFirstProgressStatus(
                progressStatusEligibilityCode[evaluationType].defenseFail
              );
              break;
            case "1":
              student.progressStatus = updateMinorProgressStatus(
                progressStatusEligibilityCode[evaluationType].defenseFail
              );
              break;
            case "2":
              student.progressStatus = updateMajorProgressStatus(
                progressStatusEligibilityCode[evaluationType].defenseFail
              );
              break;
          }
        } else if (projectJudgement === proposalJudgementConfig.REJECTED) {
          // Handle rejected projects
          switch (eventType) {
            case "0":
              student.isAssociated = false;
              student.progressStatus = updateProjectFirstProgressStatus(
                progressStatusEligibilityCode[evaluationType].rejected
              );
              student.project = undefined;
              await Project.findByIdAndUpdate(project._id, {
                status: eventStatusList.archive
              }, { session });
              break;
            case "1":
              student.isAssociated = false;
              student.progressStatus = updateMinorProgressStatus(
                progressStatusEligibilityCode[evaluationType].rejected
              );
              student.project = undefined;
              await Project.findByIdAndUpdate(project._id, {
                status: eventStatusList.archive
              }, { session });
              break;
            case "2":
              student.isAssociated = false;
              student.progressStatus = updateMajorProgressStatus(
                progressStatusEligibilityCode[evaluationType].rejected
              );
              student.project = undefined;
              await Project.findByIdAndUpdate(project._id, {
                status: eventStatusList.archive
              }, { session });
              break;
          }
        }

        return student.save({ session });
      });

      await Promise.all(studentUpdatePromises);

      // Clear report if defense failed
      if (
        projectJudgement === proposalJudgementConfig["RE-DEFENSE"] ||
        projectJudgement === proposalJudgementConfig.REJECTED ||
        projectJudgement === finalJudgementConfig["RE-DEFENSE"] ||
        projectJudgement === proposalJudgementConfig.ABSENT ||
        projectJudgement === midJudgementConfig.ABSENT ||
        projectJudgement === finalJudgementConfig.ABSENT
      ) {
        await Project.findByIdAndUpdate(project._id, {
          $unset: { [`${evaluationType}.report`]: 1 }
        }, { session });
      }
    }
  } catch (error) {
    console.error(`Error updating student progress: ${error.message}`);
    throw error;
  }
};

/**
 * Checks if all rooms in defense are complete and updates defense status
 * @param {String} defenseId - Defense ID to check
 * @param {String} evaluationType - proposal, mid, or final
 */
const checkAndUpdateDefenseCompletion = async (defenseId, evaluationType) => {
  return checkAndUpdateDefenseCompletionWithSession(defenseId, evaluationType);
};

/**
 * Checks if all rooms in defense are complete and updates defense status with transaction support
 * @param {String} defenseId - Defense ID to check
 * @param {String} evaluationType - proposal, mid, or final
 * @param {Object} session - MongoDB session for transaction
 */
const checkAndUpdateDefenseCompletionWithSession = async (defenseId, evaluationType, session) => {
  try {
    const defense = await Defense.findById(defenseId).session(session).populate({
      path: 'rooms',
      populate: {
        path: 'projects'
      }
    });

    if (!defense) {
      console.error(`Defense not found: ${defenseId}`);
      return;
    }

    let allRoomsCompleted = true;

    for (const room of defense.rooms) {
      let roomCompleted = true;

      for (const project of room.projects) {
        const projectDefenses = project[evaluationType].defenses;
        const hasGradedDefense = projectDefenses.some(def => def.isGraded);

        if (!hasGradedDefense) {
          roomCompleted = false;
          break;
        }
      }

      if (roomCompleted && !room.isCompleted) {
        await Room.findByIdAndUpdate(room._id, { isCompleted: true }, { session });
        console.log(`Room ${room._id} marked as completed`);
      }

      if (!roomCompleted) {
        allRoomsCompleted = false;
      }
    }

    if (allRoomsCompleted) {
      await Defense.findByIdAndUpdate(defenseId, {
        status: eventStatusList.complete
      }, { session });
      console.log(`Defense ${defenseId} marked as complete`);
    }
  } catch (error) {
    console.error(`Error updating defense completion: ${error.message}`);
  }
};

/**
 * Clears evaluator access codes when all projects are evaluated
 * @param {String} evaluatorId - Evaluator ID
 * @param {String} defenseId - Defense ID  
 * @param {String} roomId - Room ID
 * @param {String} evaluationType - proposal, mid, or final
 */
const clearEvaluatorAccessCodes = async (evaluatorId, defenseId, roomId, evaluationType) => {
  return clearEvaluatorAccessCodesWithSession(evaluatorId, defenseId, roomId, evaluationType);
};

/**
 * Clears evaluator access codes when all projects are evaluated with transaction support
 * @param {String} evaluatorId - Evaluator ID
 * @param {String} defenseId - Defense ID  
 * @param {String} roomId - Room ID
 * @param {String} evaluationType - proposal, mid, or final
 * @param {Object} session - MongoDB session for transaction
 */
const clearEvaluatorAccessCodesWithSession = async (evaluatorId, defenseId, roomId, evaluationType, session) => {
  try {
    const room = await Room.findById(roomId).session(session).populate('projects');
    const projects = await Project.find({ _id: { $in: room.projects } }).session(session);

    const allProjectsEvaluated = determineAllProjectsEvaluatedByEvaluator({
      projects,
      evaluationType,
      defenseId,
      evaluatorId,
    });

    if (allProjectsEvaluated) {
      const evaluator = await Evaluator.findById(evaluatorId).session(session);
      if (evaluator) {
        const defenseObj = evaluator.defense.find((defense) => {
          return defense.defenseId.toString() === defenseId;
        });

        if (defenseObj) {
          defenseObj.accessCode = undefined;
          await evaluator.save({ session });
          console.log(`Access code cleared for evaluator ${evaluatorId}`);
        }
      }
    }
  } catch (error) {
    console.error(`Error clearing access codes: ${error.message}`);
  }
};

/**
 * Creates evaluation record based on evaluation type
 * @param {Object} params - Evaluation parameters
 * @returns {Object} Created evaluation record
 */
const createEvaluationRecord = async (params) => {
  return createEvaluationRecordWithSession({ ...params });
};

/**
 * Creates evaluation record based on evaluation type with transaction support
 * @param {Object} params - Evaluation parameters with session
 * @returns {Object} Created evaluation record
 */
const createEvaluationRecordWithSession = async ({
  individualEvaluation,
  projectEvaluation,
  projectId,
  evaluatorId,
  defenseId,
  eventId,
  evaluationType,
  session
}) => {
  let formattedIndividualEvaluations;


  try {
    switch (evaluationType) {
      case "proposal":
        console.log("Proposal Evaluation Block");
        formattedIndividualEvaluations = individualEvaluation.map((evaluation) => ({
          student: evaluation.member,
          performanceAtPresentation: evaluation.performanceAtPresentation || "0",
          absent: evaluation.absent || false,
          projectTitleAndAbstract: evaluation.absent ? "0" : (projectEvaluation.projectTitleAndAbstract || "0"),
          project: evaluation.absent ? "0" : (projectEvaluation.project || "0"),
          objective: evaluation.absent ? "0" : (projectEvaluation.objective || "0"),
          teamWork: evaluation.absent ? "0" : (projectEvaluation.teamWork || "0"),
          documentation: evaluation.absent ? "0" : (projectEvaluation.documentation || "0"),
          plagiarism: evaluation.absent ? "0" : (projectEvaluation.plagiarism || "0"),
        }));
        break;

      case "mid":
        console.log("Mid Evaluation Block");
        formattedIndividualEvaluations = individualEvaluation.map((evaluation) => ({
          student: evaluation.member,
          performanceAtPresentation: evaluation.performanceAtPresentation || "0",
          absent: evaluation.absent || false,
          feedbackIncorporated: evaluation.absent ? "0" : (projectEvaluation.feedbackIncorporated || "0"),
          workProgress: evaluation.absent ? "0" : (projectEvaluation.workProgress || "0"),
          documentation: evaluation.absent ? "0" : (projectEvaluation.documentation || "0"),
        }));
        break;

      case "final":
        console.log("Final Evaluation Block");
        formattedIndividualEvaluations = individualEvaluation.map((evaluation) => ({
          student: evaluation.member,
          performanceAtPresentation: evaluation.performanceAtPresentation || "0",
          absent: evaluation.absent || false,
          contributionInWork: evaluation.absent ? "0" : (evaluation.contributionInWork || "0"),
          projectTitle: evaluation.absent ? "0" : (projectEvaluation.projectTitle || "0"),
          volume: evaluation.absent ? "0" : (projectEvaluation.volume || "0"),
          objective: evaluation.absent ? "0" : (projectEvaluation.objective || "0"),
          creativity: evaluation.absent ? "0" : (projectEvaluation.creativity || "0"),
          analysisAndDesign: evaluation.absent ? "0" : (projectEvaluation.analysisAndDesign || "0"),
          toolAndTechniques: evaluation.absent ? "0" : (projectEvaluation.toolAndTechniques || "0"),
          documentation: evaluation.absent ? "0" : (projectEvaluation.documentation || "0"),
          accomplished: evaluation.absent ? "0" : (projectEvaluation.accomplished || "0"),
          demo: evaluation.absent ? "0" : (projectEvaluation.demo || "0"),
        }));
        break;

      default:
        throw new Error("Invalid evaluation type");
    }
  } catch (error) {
    console.error("Error formatting evaluation data:", error);
    throw new Error("Failed to format evaluation data: " + error.message);
  }

  let newEvaluation;
  try {
    const createdEvaluations = await Evaluation.create([{
      individualEvaluation: formattedIndividualEvaluations,
      projectEvaluation: projectEvaluation,
      project: projectId,
      evaluator: evaluatorId,
      defense: defenseId,
      event: eventId,
      evaluationType: evaluationType,
    }], { session });
    
    newEvaluation = createdEvaluations[0];
    
    if (!newEvaluation) {
      throw new Error("Failed to create evaluation record");
    }
  } catch (error) {
    console.error("Error creating evaluation:", error);
    throw new Error("Failed to create evaluation record: " + error.message);
  }
  
  // Update defense and project with evaluation reference
  try {
    await Defense.findByIdAndUpdate(defenseId, {
      $push: { evaluations: newEvaluation._id }
    }, { session });
    
    await Project.findByIdAndUpdate(projectId, {
      $push: { [`${evaluationType}.evaluations`]: newEvaluation._id }
    }, { session });
  } catch (error) {
    console.error("Error updating references:", error);
    throw new Error("Failed to update evaluation references: " + error.message);
  }
  
  console.log("New Evaluation Created");
  return newEvaluation;
};

module.exports = {
  getDefenseBydId,
  getProjectBydId,
  submitEvaluation,
  updateStudentProgressStatusWithSession,
  checkAndUpdateDefenseCompletion,
  checkAndUpdateDefenseCompletionWithSession,
  clearEvaluatorAccessCodes,
  clearEvaluatorAccessCodesWithSession,
  createEvaluationRecord,
  createEvaluationRecordWithSession,
};
