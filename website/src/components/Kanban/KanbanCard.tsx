import React, { useMemo } from "react";
import { Draggable } from "react-beautiful-dnd";
import { TaskWithProperties } from "../../types/task";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import _ from "lodash";
import { kanbanDataName } from "../../types/kanban";
import Card from "../Card/Card";

interface KanbanCardProps {
  task: TaskWithProperties;
  index: number;
  onEdit: (task: TaskWithProperties) => void;
  cardVisibleProperties: string[];
  dataName: kanbanDataName;
}

const KanbanCard: React.FC<KanbanCardProps> = ({
  task,
  index,
  onEdit,
  cardVisibleProperties,
  dataName,
}) => {
  const propertySetting = useSelector(
    (state: RootState) => state.kanban.propertySetting,
  );

  const tasks: TaskWithProperties[] = useSelector((state: RootState) => {
    return state.kanban[dataName] as TaskWithProperties[];
  });

  const propertyOptionsIdNameMap = useMemo(() => {
    const taskIdTitleMap = _.reduce(
      tasks,
      (result, task) => {
        result[task.id] = task.title;
        return result;
      },
      {} as Record<string, string>,
    );

    const propertyIdNameMap = _.reduce(
      propertySetting,
      (result, property) => {
        _.each(property.options, (option) => {
          result[option.id] = option.name;
        });
        return result;
      },
      {} as Record<string, string>,
    );

    return _.merge({}, taskIdTitleMap, propertyIdNameMap);
  }, [tasks, propertySetting]);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`${snapshot.isDragging ? "transform scale-105" : ""}`}
          style={{ position: "relative", ...provided.draggableProps.style }}
          data-cy="kanban-task"
          id={task.id}
          onClick={() => onEdit(task)}
        >
          <Card
            task={task}
            cardVisibleProperties={cardVisibleProperties}
            propertyOptionsIdNameMap={propertyOptionsIdNameMap}
            readonly={true}
          />
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;
