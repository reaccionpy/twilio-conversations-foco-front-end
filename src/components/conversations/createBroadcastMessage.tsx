import React, { useState } from "react";
import { Client } from "@twilio/conversations";
import { PlusIcon } from "@twilio-paste/icons/esm/PlusIcon";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, AppState } from "../../store";
import { getTranslation } from "./../../utils/localUtils";
import {
  AppBar,
  Box,
  Button,
  Dialog,
  IconButton,
  Slide,
  Toolbar,
  Typography,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { Close } from "@mui/icons-material";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { styled } from "@mui/material/styles";
import { Field, Form, Formik } from "formik";

// ✅ Updated Interfaces for templates
interface TemplateTypes {
  "twilio/text": {
    body: string;
  };
}

interface Template {
  sid: string;
  accountSid: string;
  friendlyName: string;
  language: string;
  variables: Record<string, any>;
  types: TemplateTypes;
  dateCreated: string;
  dateUpdated: string;
  url: string;
  links: {
    approval_create: string;
    approval_fetch: string;
  };
}

interface NewConvoProps {
  client?: Client;
  collapsed: boolean;
}

// ✅ Transition Effect for Dialog
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// ✅ Styled component for the form container
const Body = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing(4),
}));

const CreateBroadcastButton: React.FC<NewConvoProps> = ({
  client,
  collapsed,
}) => {
  const dispatch = useDispatch();
  const { updateCurrentConversation, addNotifications, updateParticipants } =
    bindActionCreators(actionCreators, dispatch);

  const local = useSelector((state: AppState) => state.local);
  const createNewConvo = getTranslation(local, "createNewBroadcast");

  // ✅ Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpen = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);

  // ✅ Fetch Templates using React Query
  const {
    data: templates,
    isLoading,
    isError,
    error,
  } = useQuery<Template[]>({
    enabled: client != null,
    queryFn: async () => {
      const functionUrl = "https://reaccion-6764.twil.io/get-templates";
      const response = await axios.get<{ templates: Template[] }>(functionUrl, {
        headers: {
          Authorization: `Bearer ${client!.token}`,
        },
      });
      return response.data.templates;
    },
    queryKey: ["getTemplates"],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // ✅ Extract placeholders from a template
  const extractPlaceholders = (text: string): string[] => {
    const regex = /{{(.*?)}}/g;
    const matches = [...text.matchAll(regex)];
    return matches.map((match) => match[1]); // Extract placeholder names
  };

  // ✅ State for selected template & placeholders
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [placeholders, setPlaceholders] = useState<string[]>([]);

  // ✅ React Query Mutation to send WhatsApp message
  const sendWhatsAppMessage = useMutation(
    async (data: {
      templateSid: string;
      placeholders: Record<string, string>;
      listNumber: string;
    }) => {
      const functionUrl = "https://reaccion-6764.twil.io/send-message";

      try {
        const response = await axios.post(functionUrl, data, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${client!.token}`,
          },
        });
        return response.data;
      } catch (error) {
        console.error("API Error:", error);
        throw new Error("Failed to send message.");
      }
    }
  );

  const listNameOptions = [
    "equipoTesting",
    "equipoTecnico",
    "equipoOperativo",
    "suscritosEnElFormulario",
    "directoresDocentes",
  ];

  return (
    <>
      <Button variant="contained" fullWidth onClick={handleOpen}>
        <PlusIcon decorative={false} title="Add convo" />
        {!collapsed ? createNewConvo : null}
      </Button>

      <Dialog
        fullScreen
        open={isModalOpen}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <Close />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Create new broadcast
            </Typography>
            <Button autoFocus color="inherit" onClick={handleClose}>
              Save
            </Button>
          </Toolbar>
        </AppBar>

        <Body>
          {templates && (
            <Formik
              initialValues={{
                placeholders: {},
                templateSid: "",
                listNumber: listNameOptions.at(0),
              }}
              onSubmit={(values, { setSubmitting }) => {
                if (!selectedTemplate) {
                  alert("Please select a template first.");
                  return;
                }

                // Convert placeholders object to numbered format for Twilio API
                const numberedPlaceholders: Record<string, string> = {};
                Object.keys(values.placeholders).forEach((key, index) => {
                  numberedPlaceholders[(index + 1).toString()] =
                    values.placeholders[key];
                });

                sendWhatsAppMessage.mutate(
                  {
                    templateSid: values.templateSid,
                    placeholders: numberedPlaceholders,
                    listNumber: values.listNumber,
                  },
                  {
                    onSuccess: (data) => {
                      alert("Message sent successfully!");
                      handleClose();
                    },
                    onError: (error) => {
                      alert("Failed to send message.");
                    },
                    onSettled: () => {
                      setSubmitting(false);
                    },
                  }
                );
              }}
            >
              {({ setFieldValue, values }) => (
                <Form className="form-container">
                  <h2>Select a Template</h2>

                  {/* Template Selection */}
                  <div className="form-group">
                    <label htmlFor="listNumber">Lista de numeros</label>
                    <Field
                      as="select"
                      id="listNumber"
                      name="listNumber"
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {}}
                    >
                      <option value="">-- Choose a Template --</option>
                      {listNameOptions.map((listName) => (
                        <option key={listName} value={listName}>
                          {listName}
                        </option>
                      ))}
                    </Field>
                  </div>

                  <div className="form-group">
                    <label htmlFor="templateSid">WhatsApp Template</label>
                    <Field
                      as="select"
                      id="templateSid"
                      name="templateSid"
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const selected = templates.find(
                          (t) => t.sid === e.target.value
                        );
                        if (selected) {
                          setFieldValue("templateSid", selected.sid);

                          const childKey = Object.keys(selected.types).at(0);
                          // Get the template text from the new structure
                          const templateText =
                            selected.types[childKey]?.body ?? "";
                          setSelectedTemplate(templateText);

                          const extracted = extractPlaceholders(templateText);
                          setPlaceholders(extracted);

                          // Reset placeholders in Formik state
                          const placeholderValues = extracted.reduce(
                            (acc, key) => ({ ...acc, [key]: "" }),
                            {}
                          );
                          setFieldValue("placeholders", placeholderValues);
                        }
                      }}
                    >
                      <option value="">-- Choose a Template --</option>
                      {templates.map((template) => (
                        <option key={template.sid} value={template.sid}>
                          {template.friendlyName} ({template.language})
                        </option>
                      ))}
                    </Field>
                  </div>

                  {selectedTemplate && (
                    <div className="template-preview">
                      <h3>Template Preview</h3>
                      <div className="preview-container">
                        {selectedTemplate.split(/({{.*?}})/g).length > 0 ? (
                          selectedTemplate
                            .split(/({{.*?}})/g)
                            .map((part, index) => {
                              if (
                                part.startsWith("{{") &&
                                part.endsWith("}}")
                              ) {
                                const paramName = part.slice(2, -2);
                                return (
                                  <div
                                    key={index}
                                    className="placeholder-input"
                                  >
                                    <label
                                      htmlFor={`placeholders.${paramName}`}
                                    >
                                      {paramName}:
                                    </label>
                                    <Field
                                      id={`placeholders.${paramName}`}
                                      name={`placeholders.${paramName}`}
                                      placeholder={paramName}
                                    />
                                  </div>
                                );
                              } else {
                                return <span key={index}>{part}</span>;
                              }
                            })
                        ) : (
                          <span>{selectedTemplate}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  {selectedTemplate && values.listNumber != null && (
                    <button
                      type="submit"
                      className="send-button"
                      disabled={!values.templateSid}
                    >
                      Send Message
                    </button>
                  )}
                </Form>
              )}
            </Formik>
          )}

          {isLoading && <p>Loading templates...</p>}
          {isError && <p>Error loading templates: {error.toString()}</p>}
        </Body>
      </Dialog>
    </>
  );
};

export default CreateBroadcastButton;
