import React, { useState, useEffect, useRef, useReducer } from "react";
import PropTypes from "prop-types";
import { values } from "lodash";
import Button from "antd/lib/button";
import Icon from "antd/lib/icon";
import Tooltip from "antd/lib/tooltip";
import Popover from "antd/lib/popover";
import Radio from "antd/lib/radio";
import ParameterValueInput from "@/components/ParameterValueInput";
import ParameterMappingEditor from "@/components/ParameterMappingEditor";
import Form from "antd/lib/form";
import { QueryBasedParameterMappingType } from "@/services/parameters/QueryBasedDropdownParameter";

const formItemProps = { labelCol: { span: 6 }, wrapperCol: { span: 16 } };
export default function QueryBasedParameterMappingEditor({ parameter, mapping, searchAvailable, onChange }) {
  const [showPopover, setShowPopover] = useState(false);
  const [newMapping, setNewMapping] = useReducer((prevState, updates) => ({ ...prevState, ...updates }), mapping);

  const newMappingRef = useRef(newMapping);
  useEffect(() => {
    if (
      mapping.mappingType !== newMappingRef.current.mappingType ||
      mapping.staticValue !== newMappingRef.current.staticValue
    ) {
      setNewMapping(mapping);
    }
  }, [mapping]);

  const parameterRef = useRef(parameter);
  useEffect(() => {
    parameterRef.current.setValue(mapping.staticValue);
  }, [mapping.staticValue]);

  const onCancel = () => {
    setNewMapping(mapping);
    setShowPopover(false);
  };

  const onSave = () => {
    onChange(newMapping);
    setShowPopover(false);
  };

  let currentState = "Undefined";
  if (mapping.mappingType === QueryBasedParameterMappingType.DROPDOWN_SEARCH) {
    currentState = "Dropdown Search";
  } else if (mapping.mappingType === QueryBasedParameterMappingType.STATIC) {
    currentState = `Static value: ${mapping.staticValue}`;
  }
  return (
    <>
      {currentState}
      <Popover
        placement="left"
        trigger="click"
        content={
          <ParameterMappingEditor header="Edit Parameter Source" onCancel={onCancel} onSave={onSave}>
            <Form>
              <Form.Item className="m-b-15" label="Source" {...formItemProps}>
                <Radio.Group
                  value={newMapping.mappingType}
                  onChange={({ target }) => setNewMapping({ mappingType: target.value })}>
                  <Radio
                    className="radio"
                    value={QueryBasedParameterMappingType.DROPDOWN_SEARCH}
                    disabled={!searchAvailable || parameter.type !== "text"}>
                    Dropdown Search{" "}
                    {(!searchAvailable || parameter.type !== "text") && (
                      <Tooltip
                        title={
                          searchAvailable
                            ? "Dropdown Search is only available for Text Parameters"
                            : "There is already a parameter mapped with the Dropdown Search type."
                        }>
                        <Icon type="question-circle" theme="filled" />
                      </Tooltip>
                    )}
                  </Radio>
                  <Radio className="radio" value={QueryBasedParameterMappingType.STATIC}>
                    Static Value
                  </Radio>
                </Radio.Group>
              </Form.Item>
              {newMapping.mappingType === QueryBasedParameterMappingType.STATIC && (
                <Form.Item label="Value" {...formItemProps}>
                  <ParameterValueInput
                    type={parameter.type}
                    value={parameter.normalizedValue}
                    enumOptions={parameter.enumOptions}
                    queryId={parameter.queryId}
                    parameter={parameter}
                    onSelect={value => {
                      parameter.setValue(value);
                      setNewMapping({ staticValue: parameter.getExecutionValue({ joinListValues: true }) });
                    }}
                  />
                </Form.Item>
              )}
            </Form>
          </ParameterMappingEditor>
        }
        visible={showPopover}
        onVisibleChange={setShowPopover}>
        <Button className="m-l-5" size="small" type="dashed">
          <Icon type="edit" />
        </Button>
      </Popover>
    </>
  );
}

QueryBasedParameterMappingEditor.propTypes = {
  parameter: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  mapping: PropTypes.shape({
    mappingType: PropTypes.oneOf(values(QueryBasedParameterMappingType)),
    staticValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  searchAvailable: PropTypes.bool,
  onChange: PropTypes.func,
};

QueryBasedParameterMappingEditor.defaultProps = {
  mapping: { mappingType: QueryBasedParameterMappingType.UNDEFINED, staticValue: undefined },
  searchAvailable: false,
  onChange: () => {},
};