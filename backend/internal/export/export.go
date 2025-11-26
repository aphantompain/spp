package export

import (
	"bytes"
	"fmt"
	"taskmanager-backend/internal/models"

	"github.com/xuri/excelize/v2"
)

func ExportProjectToExcel(project *models.Project) (*bytes.Buffer, error) {
	f := excelize.NewFile()
	defer f.Close()

	sheetName := "Проект"
	index, err := f.NewSheet(sheetName)
	if err != nil {
		return nil, err
	}
	f.SetActiveSheet(index)

	f.DeleteSheet("Sheet1")

	styleHeader, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{
			Bold: true,
			Size: 16,
		},
		Fill: excelize.Fill{
			Type:    "pattern",
			Color:   []string{"#4472C4"},
			Pattern: 1,
		},
		Alignment: &excelize.Alignment{
			Horizontal: "center",
			Vertical:   "center",
		},
	})

	f.SetCellValue(sheetName, "A1", "Информация о проекте")
	f.MergeCell(sheetName, "A1", "B1")
	f.SetCellStyle(sheetName, "A1", "B1", styleHeader)
	f.SetRowHeight(sheetName, 1, 25)

	row := 3
	styleLabel, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{
			Bold: true,
		},
	})

	styleValue, _ := f.NewStyle(&excelize.Style{
		Alignment: &excelize.Alignment{
			WrapText: true,
		},
	})

	projectData := map[string]interface{}{
		"Название":        project.Title,
		"Описание":        project.Description,
		"Статус":          project.Status,
		"Дата создания":   project.CreatedAt.Format("02.01.2006 15:04"),
		"Дата обновления": project.UpdatedAt.Format("02.01.2006 15:04"),
	}

	for label, value := range projectData {
		f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), label)
		f.SetCellStyle(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), styleLabel)
		f.SetCellValue(sheetName, fmt.Sprintf("B%d", row), value)
		f.SetCellStyle(sheetName, fmt.Sprintf("B%d", row), fmt.Sprintf("B%d", row), styleValue)
		row++
	}

	if len(project.Tasks) > 0 {
		row += 2
		f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), "Задачи проекта")
		f.MergeCell(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("G%d", row))
		f.SetCellStyle(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("G%d", row), styleHeader)
		f.SetRowHeight(sheetName, row, 25)
		row++

		headers := []string{"Название", "Описание", "Статус", "Приоритет", "Исполнитель", "Создано", "Срок"}
		styleTableHeader, _ := f.NewStyle(&excelize.Style{
			Font: &excelize.Font{
				Bold: true,
			},
			Fill: excelize.Fill{
				Type:    "pattern",
				Color:   []string{"#D9E1F2"},
				Pattern: 1,
			},
			Alignment: &excelize.Alignment{
				Horizontal: "center",
				Vertical:   "center",
			},
		})

		for i, header := range headers {
			cell := fmt.Sprintf("%c%d", 'A'+i, row)
			f.SetCellValue(sheetName, cell, header)
			f.SetCellStyle(sheetName, cell, cell, styleTableHeader)
		}
		f.SetRowHeight(sheetName, row, 20)
		row++

		for _, task := range project.Tasks {
			dueDate := ""
			if task.DueDate != nil {
				dueDate = task.DueDate.Format("02.01.2006")
			}

			values := []interface{}{
				task.Content,
				task.Description,
				task.Status,
				task.Priority,
				task.Assignee,
				task.CreatedAt.Format("02.01.2006"),
				dueDate,
			}

			for i, value := range values {
				cell := fmt.Sprintf("%c%d", 'A'+i, row)
				f.SetCellValue(sheetName, cell, value)
			}
			row++
		}

		for i := 0; i < len(headers); i++ {
			col := string(rune('A' + i))
			f.SetColWidth(sheetName, col, col, 15)
		}
	}

	var buf bytes.Buffer
	if err := f.Write(&buf); err != nil {
		return nil, err
	}

	return &buf, nil
}

func ExportProjectToWord(project *models.Project) (*bytes.Buffer, error) {
	var buf bytes.Buffer

	buf.WriteString("<!DOCTYPE html>\n")
	buf.WriteString("<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>\n")
	buf.WriteString("<head>\n")
	buf.WriteString("<meta charset='utf-8'>\n")
	buf.WriteString("<title>Проект: " + project.Title + "</title>\n")
	buf.WriteString("<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->\n")
	buf.WriteString("<style>\n")
	buf.WriteString("body { font-family: Arial, sans-serif; margin: 40px; }\n")
	buf.WriteString("h1 { color: #4472C4; border-bottom: 2px solid #4472C4; padding-bottom: 10px; }\n")
	buf.WriteString("h2 { color: #70AD47; margin-top: 30px; }\n")
	buf.WriteString("table { border-collapse: collapse; width: 100%; margin-top: 20px; }\n")
	buf.WriteString("th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }\n")
	buf.WriteString("th { background-color: #4472C4; color: white; font-weight: bold; }\n")
	buf.WriteString("tr:nth-child(even) { background-color: #f2f2f2; }\n")
	buf.WriteString(".info-row { margin: 10px 0; }\n")
	buf.WriteString(".label { font-weight: bold; color: #333; }\n")
	buf.WriteString("</style>\n")
	buf.WriteString("</head>\n")
	buf.WriteString("<body>\n")

	buf.WriteString("<h1>Проект: " + escapeHTML(project.Title) + "</h1>\n")

	buf.WriteString("<div class='info-row'><span class='label'>Описание:</span> " + escapeHTML(project.Description) + "</div>\n")
	buf.WriteString("<div class='info-row'><span class='label'>Статус:</span> " + escapeHTML(project.Status) + "</div>\n")
	buf.WriteString("<div class='info-row'><span class='label'>Дата создания:</span> " + project.CreatedAt.Format("02.01.2006 15:04") + "</div>\n")
	buf.WriteString("<div class='info-row'><span class='label'>Дата обновления:</span> " + project.UpdatedAt.Format("02.01.2006 15:04") + "</div>\n")

	if len(project.Tasks) > 0 {
		buf.WriteString("<h2>Задачи проекта</h2>\n")
		buf.WriteString("<table>\n")
		buf.WriteString("<tr><th>Название</th><th>Описание</th><th>Статус</th><th>Приоритет</th><th>Исполнитель</th><th>Создано</th><th>Срок</th></tr>\n")

		for _, task := range project.Tasks {
			dueDate := "-"
			if task.DueDate != nil {
				dueDate = task.DueDate.Format("02.01.2006")
			}

			buf.WriteString("<tr>")
			buf.WriteString("<td>" + escapeHTML(task.Content) + "</td>")
			buf.WriteString("<td>" + escapeHTML(task.Description) + "</td>")
			buf.WriteString("<td>" + escapeHTML(task.Status) + "</td>")
			buf.WriteString("<td>" + escapeHTML(task.Priority) + "</td>")
			buf.WriteString("<td>" + escapeHTML(task.Assignee) + "</td>")
			buf.WriteString("<td>" + task.CreatedAt.Format("02.01.2006") + "</td>")
			buf.WriteString("<td>" + dueDate + "</td>")
			buf.WriteString("</tr>\n")
		}

		buf.WriteString("</table>\n")
	}

	buf.WriteString("</body>\n")
	buf.WriteString("</html>\n")

	return &buf, nil
}

func escapeHTML(s string) string {
	result := ""
	for _, r := range s {
		switch r {
		case '<':
			result += "&lt;"
		case '>':
			result += "&gt;"
		case '&':
			result += "&amp;"
		case '"':
			result += "&quot;"
		case '\'':
			result += "&#39;"
		default:
			result += string(r)
		}
	}
	return result
}
