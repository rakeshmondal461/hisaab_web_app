import React, { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import TaskCard from "../components/TaskCard.jsx";
import GoalModal from "../components/GoalModal.jsx";
import { TASK_STATUSES, isOverdue } from "../models/taskModel.js";
import {
  year,
  month,
  currentDateDay,
  firstDay,
  lastDay,
} from "../utils/dateUtil.js";

export default function GoalsPage() {
  const { state, dispatch } = useApp();
  const [activeStatus, setActiveStatus] = useState("todo");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedOverCol, setDraggedOverCol] = useState(null);

  const filteredTasks = state.tasks.filter((t) => t.status === activeStatus);
  const hasOverdue = state.tasks.some(isOverdue);

  const handleSaveTask = (task) => {
    if (selectedTask) {
      dispatch({ type: "UPDATE_TASK", task });
    } else {
      dispatch({ type: "ADD_TASK", task });
    }
  };

  const handleDeleteTask = (id) => {
    dispatch({ type: "DELETE_TASK", id });
  };

  const generateInputs = () => {
    const elements = [];
    for (let i = firstDay; i <= lastDay; i++) {
      elements.push(<input type="checkbox" key={i} />);
    }
    return elements;
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    const task = state.tasks.find((t) => t.id === taskId);
    if (task && task.status !== targetStatus) {
      dispatch({
        type: "UPDATE_TASK",
        task: { ...task, status: targetStatus },
      });
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h2 className="title-lg fw-700" style={{ margin: 0 }}>
          Goals
        </h2>
      </div>

      <div
        className="task-columns"
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          paddingBottom: "16px",
        }}
      >
        {Array.from({ length: lastDay }, (_, i) => i + 1).map((day) => (
          <div
            key={day}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <div
              style={{
                backgroundColor: "#22cf56",
                color: "white",
                padding: "4px",
                borderRadius: "4px",
              }}
            >
              {" "}
              {String(day).padStart(2, "0")}-{month}-{year}{" "}
            </div>
            <input
              type="checkbox"
              key={day}
              checked={day <= currentDateDay}
              readOnly
              style={{
                width: "24px",
                height: "24px",
                marginRight: "2px",
                cursor: "pointer",
              }}
            />
          </div>
        ))}
      </div>

      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        task={selectedTask}
      />
    </div>
  );
}
